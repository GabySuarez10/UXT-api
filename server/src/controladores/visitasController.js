import {
  getVisitas,
  createVisita,
  getVisitaPorUidYUrl,
  updateVisitaRecurrente,
  checkVisitaReciente,
  createClic,
  createScroll,
  getClics,
  getScrolls,
} from "@/queries/visitasQueries";
import { Visita } from "@/clases/visitas";
import { Clic } from "@/clases/clics";
import { Scroll } from "@/clases/scrolls";

export class VisitasController {
  // Listar visitas, clics o scrolls según tipo_evento
  static async listar(url = null, tipo = null) {
    if (tipo === "clic") {
      const clics = await getClics(url);
      return clics.map(
        (c) =>
          new Clic(
            c.id,
            c.uid,
            c.url,
            c.dominio,
            c.elemento,
            c.posicion_x,
            c.posicion_y,
            c.timestamp,
            c.created_at,
            c.viewport_width,
            c.viewport_height,
          ),
      );
    }

    if (tipo === "scroll") {
      const scrolls = await getScrolls(url);
      return scrolls.map(
        (s) =>
          new Scroll(
            s.id,
            s.uid,
            s.url,
            s.dominio,
            s.scroll_x,
            s.scroll_y,
            s.porcentaje_scroll,
            s.timestamp,
            s.created_at,
          ),
      );
    }

    // Por defecto: visitas
    const visitas = await getVisitas(url);
    return visitas.map(
      (v) =>
        new Visita(
          v.id,
          v.uid,
          v.recurrente,
          v.title,
          v.url,
          v.dominio,
          v.userAgent,
          v.referrer,
          v.ultimavisita,
          v.created_at,
        ),
    );
  }

  // Crear o actualizar una visita (lógica original intacta)
  static async crear(data) {
    const { uid, recurrente, title, url, dominio, userAgent, referrer } = data;

    if (!uid || !url) throw new Error("UID y URL son campos obligatorios");

    console.log(`Procesando visita para UID: ${uid}, URL: ${url}`);

    const visitaExistente = await checkVisitaReciente(uid, url);

    if (visitaExistente) {
      if (!visitaExistente.esReciente) {
        console.log(
          `Visita existente (${visitaExistente.segundosTranscurridos}s). Actualizando como recurrente.`,
        );
        const visitaActualizada = await updateVisitaRecurrente(uid, url);
        return new Visita(
          visitaActualizada.id,
          visitaActualizada.uid,
          visitaActualizada.recurrente,
          visitaActualizada.title,
          visitaActualizada.url,
          visitaActualizada.dominio,
          visitaActualizada.userAgent,
          visitaActualizada.referrer,
          visitaActualizada.ultimavisita,
          visitaActualizada.created_at,
        );
      } else {
        console.log(
          `Visita reciente (${visitaExistente.segundosTranscurridos}s). No se registra.`,
        );
        const visita = await getVisitaPorUidYUrl(uid, url);
        return new Visita(
          visita.id,
          visita.uid,
          visita.recurrente,
          visita.title,
          visita.url,
          visita.dominio,
          visita.userAgent,
          visita.referrer,
          visita.ultimavisita,
          visita.created_at,
        );
      }
    } else {
      console.log("Creando nueva visita...");
      const nuevaVisita = await createVisita({
        uid,
        recurrente: recurrente || false,
        title,
        url,
        dominio,
        userAgent,
        referrer,
      });
      return new Visita(
        nuevaVisita.id,
        nuevaVisita.uid,
        nuevaVisita.recurrente,
        nuevaVisita.title,
        nuevaVisita.url,
        nuevaVisita.dominio,
        nuevaVisita.userAgent,
        nuevaVisita.referrer,
        nuevaVisita.ultimavisita,
        nuevaVisita.created_at,
      );
    }
  }

  // Registrar un clic
  static async registrarClic(data) {
    const { uid, url, dominio, elemento, posicion_x, posicion_y, timestamp, viewport_width, viewport_height } =
      data;

    if (!uid || !url)
      throw new Error("UID y URL son campos obligatorios para un clic");

    console.log(
      `Registrando clic de UID: ${uid} en ${url} — elemento: ${elemento}`,
    );

    const nuevoClic = await createClic({
      uid,
      url,
      dominio: dominio || null,
      elemento: elemento || null,
      posicion_x: posicion_x ?? 0,
      posicion_y: posicion_y ?? 0,
      timestamp: timestamp || new Date().toISOString(),
      viewport_width: viewport_width || null,
      viewport_height: viewport_height || null,
    });

    return new Clic(
      nuevoClic.id,
      nuevoClic.uid,
      nuevoClic.url,
      nuevoClic.dominio,
      nuevoClic.elemento,
      nuevoClic.posicion_x,
      nuevoClic.posicion_y,
      nuevoClic.timestamp,
      nuevoClic.created_at,
      nuevoClic.viewport_width,
      nuevoClic.viewport_height,
    );
  }

  // Registrar un scroll
  static async registrarScroll(data) {
    const {
      uid,
      url,
      dominio,
      scroll_x,
      scroll_y,
      porcentaje_scroll,
      timestamp,
    } = data;

    if (!uid || !url)
      throw new Error("UID y URL son campos obligatorios para un scroll");

    console.log(
      `Registrando scroll de UID: ${uid} en ${url} — ${porcentaje_scroll}%`,
    );

    const nuevoScroll = await createScroll({
      uid,
      url,
      dominio: dominio || null,
      scroll_x: scroll_x ?? 0,
      scroll_y: scroll_y ?? 0,
      porcentaje_scroll: porcentaje_scroll ?? 0,
      timestamp: timestamp || new Date().toISOString(),
    });

    return new Scroll(
      nuevoScroll.id,
      nuevoScroll.uid,
      nuevoScroll.url,
      nuevoScroll.dominio,
      nuevoScroll.scroll_x,
      nuevoScroll.scroll_y,
      nuevoScroll.porcentaje_scroll,
      nuevoScroll.timestamp,
      nuevoScroll.created_at,
    );
  }

  static async estadisticas(url = null) {
    const { getEstadisticasVisitas } = await import("@/queries/visitasQueries");
    return await getEstadisticasVisitas(url);
  }
}
