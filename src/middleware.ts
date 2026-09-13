import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "salon_crm_default_secret_dev_32chars_key!"
);

const AUTH_COOKIE_NAME = "salon_crm_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload;
    } catch {
      session = null;
    }
  }

  // Rutas públicas
  const isLoginPage = pathname === "/login" || pathname === "/";

  if (isLoginPage) {
    if (session) {
      if (session.rol === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (session.tipo === "agente") {
        return NextResponse.redirect(new URL("/agente", request.url));
      } else if (session.tipo === "cliente") {
        return NextResponse.redirect(new URL("/cliente", request.url));
      }
    }
    return NextResponse.next();
  }

  // Protección de rutas
  if (pathname.startsWith("/admin")) {
    if (!session || session.rol !== "admin") {
      return NextResponse.redirect(new URL("/login?from=" + pathname, request.url));
    }
  }

  if (pathname.startsWith("/agente")) {
    if (!session || (session.tipo !== "agente" && session.rol !== "admin")) {
      return NextResponse.redirect(new URL("/login?from=" + pathname, request.url));
    }
  }

  if (pathname.startsWith("/cliente")) {
    if (!session || session.tipo !== "cliente") {
      return NextResponse.redirect(new URL("/login?from=" + pathname, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
