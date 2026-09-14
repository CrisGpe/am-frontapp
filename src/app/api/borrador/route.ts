import { NextRequest, NextResponse } from "next/server";
import { getBorrador, addBorradorEntry, updateBorradorEntry } from "@/lib/google-sheets";
import { getCurrentUser } from "@/lib/auth";
import { BorradorEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.tipo !== "agente" && user.rol !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const data = await getBorrador();
  return NextResponse.json({ borrador: data });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.tipo !== "agente" && user.rol !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body: BorradorEntry = await req.json();
    const saved = await addBorradorEntry(body);
    return NextResponse.json({ success: true, entry: saved });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al guardar en el Borrador" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.tipo !== "agente" && user.rol !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { id_oatc, updates } = await req.json();
    if (!id_oatc) {
      return NextResponse.json({ error: "id_oatc es requerido" }, { status: 400 });
    }

    const updated = await updateBorradorEntry(id_oatc, updates);
    if (!updated) {
      return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, entry: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar entrada de Borrador" },
      { status: 500 }
    );
  }
}
