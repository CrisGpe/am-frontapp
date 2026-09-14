import { NextRequest, NextResponse } from "next/server";
import { getAgentes, getClientes } from "@/lib/google-sheets";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

const loginAttempts = new Map<string, { count: number, lastAttempt: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: now };
    
    if (now - attempt.lastAttempt > 5 * 60 * 1000) {
      attempt.count = 0;
    }
    
    if (attempt.count >= 5) {
      return NextResponse.json({ error: "Demasiados intentos. Espera 5 minutos." }, { status: 429 });
    }
    
    attempt.count++;
    attempt.lastAttempt = now;
    loginAttempts.set(ip, attempt);

    const body = await req.json();
    const { pin, tipo } = body;

    if (!pin || typeof pin !== "string") {
      return NextResponse.json(
        { error: "El PIN de 4 dígitos es requerido" },
        { status: 400 }
      );
    }
    
    if (!/^\d{4}$/.test(pin.trim())) {
      return NextResponse.json({ error: "PIN debe ser 4 dígitos numéricos" }, { status: 400 });
    }

    if (tipo === "agente") {
      const agentes = await getAgentes();
      const agente = agentes.find((a) => a.pin === pin.trim() && a.activo);

      if (!agente) {
        return NextResponse.json(
          { error: "PIN no válido para colaboradores" },
          { status: 401 }
        );
      }

      const session = {
        userId: agente.id,
        nombre: agente.nombre,
        tipo: "agente" as const,
        rol: agente.rol,
        especialidades: agente.especialidades,
      };

      const token = await createSessionToken(session);
      const redirectUrl = agente.rol === "admin" ? "/admin" : "/agente";

      const response = NextResponse.json({
        success: true,
        user: session,
        redirectUrl,
      });

      response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 horas
      });

      return response;
    } else {
      // Cliente
      const clientes = await getClientes();
      const cliente = clientes.find((c) => c.pin === pin.trim() && c.activo);

      if (!cliente) {
        return NextResponse.json(
          { error: "PIN no válido para clientes" },
          { status: 401 }
        );
      }

      const session = {
        userId: cliente.id,
        nombre: cliente.nombre,
        tipo: "cliente" as const,
      };

      const token = await createSessionToken(session);

      const response = NextResponse.json({
        success: true,
        user: session,
        redirectUrl: "/cliente",
      });

      response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 horas
      });

      return response;
    }
  } catch (error: any) {
    console.error("Error en POST /api/auth/login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
