import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getBorrador,
  getTodosOATC,
  getAgentes,
  getServicios,
} from "@/lib/google-sheets";
import { getTodayDateString } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const params = new URLSearchParams(url.search);
    const periodo = params.get("periodo") || "todo"; // "todo", "este_mes", "ultimos_7", "hoy"

    const [borrador, oatcHistorico, agentes, servicios] = await Promise.all([
      getBorrador(),
      getTodosOATC(),
      getAgentes(),
      getServicios(),
    ]);

    const hoyStr = getTodayDateString("America/Lima");

    // All completed attentions
    const atencionesBorrador = borrador.filter((b) => b.etapa === "completada");
    const atencionesOatc = oatcHistorico.filter(
      (o) => o.etapa === "completada" || !o.etapa // historical might not have etapa explicitly
    );

    const todas = [...atencionesOatc, ...atencionesBorrador];

    // Total Ingresos Historico
    const totalIngresosHistorico = todas.reduce((acc, curr) => acc + (Number(curr.precio_final) || 0), 0);

    // Total Ingresos Hoy
    const todasHoy = todas.filter((t) => t.fecha === hoyStr);
    const totalIngresosHoy = todasHoy.reduce((acc, curr) => acc + (Number(curr.precio_final) || 0), 0);

    // Total Ingresos Mes
    const mesActual = hoyStr.slice(0, 7); // "YYYY-MM"
    const todasMes = todas.filter((t) => t.fecha.startsWith(mesActual));
    const totalIngresosMes = todasMes.reduce((acc, curr) => acc + (Number(curr.precio_final) || 0), 0);

    // Filter "todas" by 'periodo' for the rest of the stats
    let atencionesFiltradas = todas;
    if (periodo === "hoy") {
      atencionesFiltradas = todasHoy;
    } else if (periodo === "este_mes") {
      atencionesFiltradas = todasMes;
    } else if (periodo === "ultimos_7") {
      const dateHoy = new Date(hoyStr + "T00:00:00");
      const date7 = new Date(dateHoy.getTime() - 7 * 24 * 60 * 60 * 1000);
      atencionesFiltradas = todas.filter((t) => {
        const d = new Date(t.fecha + "T00:00:00");
        return d >= date7 && d <= dateHoy;
      });
    }

    const totalIngresosPeriodo = atencionesFiltradas.reduce((acc, curr) => acc + (Number(curr.precio_final) || 0), 0);
    const totalAtenciones = atencionesFiltradas.length;
    const ticketPromedio = totalAtenciones > 0 ? totalIngresosPeriodo / totalAtenciones : 0;

    const kpis = {
      totalIngresosHistorico,
      totalIngresosHoy,
      totalIngresosMes,
      totalAtenciones,
      ticketPromedio,
      totalIngresosPeriodo,
    };

    // Ventas por dia (last 14 days, regardless of the filter, or maybe within the filter? 
    // Instructions say: "ventasPorDia: array of { fecha, total, atenciones } for the last 14 days.")
    // Let's always return the last 14 days for the trend chart, or limit to 14 days up to today.
    const ventasPorDiaMap: Record<string, { total: number; atenciones: number }> = {};
    const dateHoyObj = new Date(hoyStr + "T00:00:00");
    for (let i = 13; i >= 0; i--) {
      const d = new Date(dateHoyObj.getTime() - i * 24 * 60 * 60 * 1000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      ventasPorDiaMap[`${yyyy}-${mm}-${dd}`] = { total: 0, atenciones: 0 };
    }
    
    todas.forEach((t) => {
      if (ventasPorDiaMap[t.fecha]) {
        ventasPorDiaMap[t.fecha].total += (Number(t.precio_final) || 0);
        ventasPorDiaMap[t.fecha].atenciones += 1;
      }
    });

    const ventasPorDia = Object.keys(ventasPorDiaMap).sort().map(fecha => ({
      fecha,
      total: ventasPorDiaMap[fecha].total,
      atenciones: ventasPorDiaMap[fecha].atenciones
    }));

    // Desglose por colaborador (from filtered attentions)
    const desglosePorColaboradorMap: Record<string, { id: string, nombre: string, atenciones: number, totalVentas: number, comisionEstimada: number }> = {};
    agentes.forEach(a => {
      desglosePorColaboradorMap[a.id] = { id: a.id, nombre: a.nombre, atenciones: 0, totalVentas: 0, comisionEstimada: 0 };
    });

    atencionesFiltradas.forEach(t => {
      const idAgente = t.id_agente;
      if (!desglosePorColaboradorMap[idAgente]) {
        desglosePorColaboradorMap[idAgente] = { id: idAgente, nombre: t.nombre_agente || "Desconocido", atenciones: 0, totalVentas: 0, comisionEstimada: 0 };
      }
      desglosePorColaboradorMap[idAgente].atenciones += 1;
      desglosePorColaboradorMap[idAgente].totalVentas += (Number(t.precio_final) || 0);
      desglosePorColaboradorMap[idAgente].comisionEstimada = desglosePorColaboradorMap[idAgente].totalVentas * 0.40; // 40%
    });
    
    const desglosePorColaborador = Object.values(desglosePorColaboradorMap).sort((a, b) => b.totalVentas - a.totalVentas);

    // Servicios mas vendidos (from filtered attentions)
    const serviciosMasVendidosMap: Record<string, { id: string, nombre: string, categoria: string, cantidad: number, total: number }> = {};
    servicios.forEach(s => {
      serviciosMasVendidosMap[s.id] = { id: s.id, nombre: s.nombre, categoria: s.categoria, cantidad: 0, total: 0 };
    });

    atencionesFiltradas.forEach(t => {
      const idServicio = t.id_servicio;
      if (!serviciosMasVendidosMap[idServicio]) {
        serviciosMasVendidosMap[idServicio] = { id: idServicio, nombre: t.nombre_servicio || "Desconocido", categoria: "Otros", cantidad: 0, total: 0 };
      }
      serviciosMasVendidosMap[idServicio].cantidad += 1;
      serviciosMasVendidosMap[idServicio].total += (Number(t.precio_final) || 0);
    });

    const serviciosMasVendidos = Object.values(serviciosMasVendidosMap)
      .filter(s => s.cantidad > 0)
      .sort((a, b) => b.cantidad - a.cantidad);

    // Desglose por Categoria
    const desglosePorCategoriaMap: Record<string, { categoria: string, total: number, atenciones: number }> = {};
    serviciosMasVendidos.forEach(s => {
      if (!desglosePorCategoriaMap[s.categoria]) {
        desglosePorCategoriaMap[s.categoria] = { categoria: s.categoria, total: 0, atenciones: 0 };
      }
      desglosePorCategoriaMap[s.categoria].total += s.total;
      desglosePorCategoriaMap[s.categoria].atenciones += s.cantidad;
    });

    const desglosePorCategoria = Object.values(desglosePorCategoriaMap).sort((a, b) => b.total - a.total);

    return NextResponse.json({
      kpis,
      ventasPorDia,
      desglosePorColaborador,
      serviciosMasVendidos,
      desglosePorCategoria
    });

  } catch (error: any) {
    console.error("Error en reporte API:", error);
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
