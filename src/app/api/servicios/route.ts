import { NextResponse } from "next/server";
import { getServicios } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  const servicios = await getServicios();
  return NextResponse.json({ servicios });
}
