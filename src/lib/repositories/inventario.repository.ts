import { getProductos, updateProductoStock } from "./productos.repository";
import { getInsumos, updateInsumoStock } from "./insumos.repository";

export async function descontarInventarioPorAtencion(
  productosVendidosStr?: string,
  insumosUsadosStr?: string
): Promise<void> {
  if (productosVendidosStr) {
    const items = productosVendidosStr.split(",").map((s) => s.trim()).filter(Boolean);
    for (const item of items) {
      const [id, cantStr] = item.split(":");
      const cantidad = parseInt(cantStr, 10) || 1;
      const prods = await getProductos();
      const p = prods.find((prod) => prod.id === id);
      if (p) {
        await updateProductoStock(id, p.stock - cantidad);
      }
    }
  }

  if (insumosUsadosStr) {
    const items = insumosUsadosStr.split(",").map((s) => s.trim()).filter(Boolean);
    for (const item of items) {
      const [id, cantStr] = item.split(":");
      const cantidad = parseInt(cantStr, 10) || 1;
      const ins = await getInsumos();
      const i = ins.find((insumo) => insumo.id === id);
      if (i) {
        await updateInsumoStock(id, i.stock - cantidad);
      }
    }
  }
}
