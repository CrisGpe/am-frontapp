import { NextResponse } from "next/server";
import { getInsumos } from "@/lib/google-sheets";

export async function GET() {
  const insumos = await getInsumos();
  return NextResponse.json({ insumos });
}
