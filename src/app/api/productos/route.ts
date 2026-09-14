import { NextResponse } from "next/server";
import { getProductos } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  const productos = await getProductos();
  return NextResponse.json({ productos });
}
