import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.rol === "admin") {
    redirect("/admin");
  } else if (user.tipo === "agente") {
    redirect("/agente");
  } else {
    redirect("/cliente");
  }
}
