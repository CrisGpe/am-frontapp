/**
 * Módulo de integración para notificaciones por WhatsApp en Salón Élite & Spa (Lima, Perú).
 * Soporta generación de enlaces directos ('https://wa.me/51...') y envío via Meta WhatsApp Cloud API si está configurado.
 */

export function sanitizarTelefonoPeru(telefono?: string): string {
  if (!telefono) return "";
  // Remover caracteres no numéricos
  const soloNumeros = telefono.replace(/\D/g, "");

  // Si tiene 9 dígitos (formato celular estándar Perú 9XX-XXX-XXX), añadir 51
  if (soloNumeros.length === 9) {
    return `51${soloNumeros}`;
  }

  // Si ya empieza con 51 y tiene 11 dígitos
  if (soloNumeros.startsWith("51") && soloNumeros.length === 11) {
    return soloNumeros;
  }

  return soloNumeros;
}

export function generarLinkWhatsApp(telefono: string, mensaje: string): string {
  const telSanitizado = sanitizarTelefonoPeru(telefono);
  const mensajeCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${telSanitizado}?text=${mensajeCodificado}`;
}

export function crearMensajeConfirmacionCita({
  nombreCliente,
  nombreServicio,
  fecha,
  hora,
  nombreAgente,
}: {
  nombreCliente: string;
  nombreServicio: string;
  fecha: string;
  hora: string;
  nombreAgente: string;
}): string {
  return `¡Hola ${nombreCliente}! ✨ Tu cita en *Salón Élite & Spa* ha sido confirmada con éxito.\n\n` +
    `📅 *Fecha:* ${fecha}\n` +
    `⏰ *Hora:* ${hora} hrs\n` +
    `💇 *Servicio:* ${nombreServicio}\n` +
    `👤 *Especialista:* ${nombreAgente}\n` +
    `📍 *Ubicación:* Jesús María, Lima\n\n` +
    `Por favor llega 5 minutos antes. ¡Te esperamos para consentirte! 💆‍♀️`;
}

export function crearMensajeRecordatorioCita({
  nombreCliente,
  nombreServicio,
  fecha,
  hora,
  nombreAgente,
}: {
  nombreCliente: string;
  nombreServicio: string;
  fecha: string;
  hora: string;
  nombreAgente: string;
}): string {
  return `Hola ${nombreCliente}, te recordamos tu cita de mañana en *Salón Élite & Spa* 💖:\n\n` +
    `📅 ${fecha} a las ${hora} hrs\n` +
    `💇 ${nombreServicio} con ${nombreAgente}\n\n` +
    `Si necesitas reprogramar o tienes alguna consulta, respóndenos a este mensaje. ¡Nos vemos pronto!`;
}

export function crearMensajePuntosLealtad({
  nombreCliente,
  puntosGanados,
  puntosTotales,
}: {
  nombreCliente: string;
  puntosGanados: number;
  puntosTotales: number;
}): string {
  return `¡Gracias por tu visita a *Salón Élite*, ${nombreCliente}! 🎉\n\n` +
    `Has acumulado *+${puntosGanados} puntos* de lealtad en tu visita de hoy.\n` +
    `🌟 *Saldo total:* ${puntosTotales} puntos.\n\n` +
    `Revisa los beneficios y descuentos que puedes canjear en tu próxima visita desde la app.`;
}

/**
 * Envío programático opcional via Meta WhatsApp Cloud API
 */
export async function enviarWhatsAppCloudAPI({
  telefono,
  mensaje,
}: {
  telefono: string;
  mensaje: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    // Si no están configuradas las credenciales de Meta, retornar fallback informativo
    return {
      success: false,
      error: "Credenciales de WhatsApp Cloud API no configuradas en variables de entorno.",
    };
  }

  const telSanitizado = sanitizarTelefonoPeru(telefono);

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: telSanitizado,
        type: "text",
        text: { body: mensaje },
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error?.message || "Error al enviar mensaje de WhatsApp" };
    }

    return { success: true, data: json };
  } catch (err: any) {
    return { success: false, error: err.message || "Error de red al conectar con WhatsApp API" };
  }
}
