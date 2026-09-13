import { NextResponse } from "next/server";
import { getServicios } from "@/lib/google-sheets";

export async function GET() {
  const servicios = await getServicios();
  return NextResponse.json({ servicios });
}
