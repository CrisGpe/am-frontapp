import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserSession, RolAgente } from "./types";

const jwtSecretString = process.env.JWT_SECRET;
if (!jwtSecretString && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: JWT_SECRET no está configurado en producción");
}
const JWT_SECRET = new TextEncoder().encode(
  jwtSecretString || "salon_crm_default_secret_dev_32chars_key!"
);

export const AUTH_COOKIE_NAME = "salon_crm_session";

export async function createSessionToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      nombre: payload.nombre as string,
      tipo: payload.tipo as "agente" | "cliente",
      rol: (payload.rol as RolAgente) || "agente",
      especialidades: payload.especialidades as string[] | undefined,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
