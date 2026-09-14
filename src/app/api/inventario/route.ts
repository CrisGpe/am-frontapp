import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getProductos,
  getInsumos,
  updateProductoStock,
  updateInsumoStock,
} from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.tipo !== "agente" && user.rol !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const [productos, insumos] = await Promise.all([
    getProductos(),
    getInsumos(),
  ]);

  const umbralBajo = 3;

  const productosConAlerta = productos.map((p) => ({
    ...p,
    alertaStockBajo: p.stock <= umbralBajo,
  }));

  const insumosConAlerta = insumos.map((i) => ({
    ...i,
    alertaStockBajo: i.stock <= umbralBajo,
  }));

  const totalAlertas =
    productosConAlerta.filter((p) => p.alertaStockBajo).length +
    insumosConAlerta.filter((i) => i.alertaStockBajo).length;

  return NextResponse.json({
    productos: productosConAlerta,
    insumos: insumosConAlerta,
    totalAlertas,
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.rol !== "admin") {
    return NextResponse.json({ error: "Solo administradores pueden modificar inventario" }, { status: 403 });
  }

  try {
    const { tipo, id, nuevoStock } = await req.json();

    if (!tipo || !id || nuevoStock === undefined || nuevoStock < 0) {
      return NextResponse.json(
        { error: "tipo ('producto' | 'insumo'), id y nuevoStock (>= 0) son requeridos" },
        { status: 400 }
      );
    }

    if (tipo === "producto") {
      const actualizado = await updateProductoStock(id, Number(nuevoStock));
      return NextResponse.json({ success: true, item: actualizado });
    } else if (tipo === "insumo") {
      const actualizado = await updateInsumoStock(id, Number(nuevoStock));
      return NextResponse.json({ success: true, item: actualizado });
    } else {
      return NextResponse.json({ error: "Tipo no válido" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar inventario" },
      { status: 500 }
    );
  }
}
