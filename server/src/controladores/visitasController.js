import { 
  getVisitas, 
  createVisita, 
  getVisitaPorUidYUrl, 
  updateVisitaRecurrente,
  checkVisitaReciente 
} from "@/queries/visitasQueries";
import { Visita } from "@/clases/visitas";

export class VisitasController {
  // Listar todas las visitas, opcionalmente filtradas por URL
  static async listar(url = null) {
    const visitas = await getVisitas(url);
    return visitas.map(v => new Visita(
      v.id, v.uid, v.recurrente, v.title, v.url, 
      v.dominio, v.userAgent, v.referrer, v.ultimavisita, v.created_at
    ));
  }

  // Crear o actualizar una visita
  static async crear(data) {
    const { uid, recurrente, title, url, dominio, userAgent, referrer } = data;
    
    // Validar campos obligatorios
    if (!uid || !url) {
      throw new Error("UID y URL son campos obligatorios");
    }
    
    console.log(`Procesando visita para UID: ${uid}, URL: ${url}`);
    
    // Verificar si ya existe una visita previa
    const visitaExistente = await checkVisitaReciente(uid, url);
    
    if (visitaExistente) {
      // Si existe y la última visita fue hace más de un minuto
      if (!visitaExistente.esReciente) {
        console.log(`Visita existente (${visitaExistente.segundosTranscurridos}s). Actualizando como recurrente.`);
        
        // Actualizar la visita existente como recurrente
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
          visitaActualizada.created_at
        );
      } else {
        // Si la visita fue hace menos de un minuto, no hacer nada
        console.log(`Visita reciente (${visitaExistente.segundosTranscurridos}s). No se registra nueva visita.`);
        
        // Devolver la visita existente
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
          visita.created_at
        );
      }
    } else {
      // No existe visita previa, crear nueva
      console.log("Creando nueva visita...");
      
      const nuevaVisita = await createVisita({
        uid, 
        recurrente: recurrente || false, 
        title, 
        url, 
        dominio, 
        userAgent, 
        referrer
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
        nuevaVisita.created_at
      );
    }
  }

  // Obtener estadísticas de visitas
  static async estadisticas(url = null) {
    const { getEstadisticasVisitas } = await import("@/queries/visitasQueries");
    return await getEstadisticasVisitas(url);
  }
}