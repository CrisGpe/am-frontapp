import { NextResponse } from "next/server";
import { getInsumos } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  const insumos = await getInsumos();
  return NextResponse.json({ insumos });
}
