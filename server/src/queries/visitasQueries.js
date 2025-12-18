import pool from "@/lib/db";

// Obtener todas las visitas, opcionalmente filtradas por URL
export async function getVisitas(url = null) {
  try {
    let query = "SELECT * FROM visitas ORDER BY ultimavisita DESC";
    let params = [];
    
    if (url) {
      query = "SELECT * FROM visitas WHERE url = $1 ORDER BY ultimavisita DESC";
      params.push(url);
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en getVisitas:", error);
    throw error;
  }
}

// Obtener una visita específica por uid y url
export async function getVisitaPorUidYUrl(uid, url) {
  try {
    const result = await pool.query(
      "SELECT * FROM visitas WHERE uid = $1 AND url = $2",
      [uid, url]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error en getVisitaPorUidYUrl:", error);
    throw error;
  }
}

// Crear una nueva visita
export async function createVisita(data) {
  try {
    const { uid, recurrente, title, url, dominio, userAgent, referrer } = data;
    
    const result = await pool.query(
      `INSERT INTO visitas 
       (uid, recurrente, title, url, dominio, userAgent, referrer, ultimavisita)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [uid, recurrente, title, url, dominio, userAgent, referrer]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error("Error en createVisita:", error);
    throw error;
  }
}

// Actualizar última visita y cambiar recurrente a true
export async function updateVisitaRecurrente(uid, url) {
  try {
    const result = await pool.query(
      `UPDATE visitas 
       SET recurrente = true, ultimavisita = current_timestamp
       WHERE uid = $1 AND url = $2
       RETURNING *`,
      [uid, url]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error("Error en updateVisitaRecurrente:", error);
    throw error;
  }
}

// Verificar si la última visita fue hace más de un minuto
export async function checkVisitaReciente(uid, url) {
  try {
    const result = await pool.query(
      `SELECT id, ultimavisita, 
       EXTRACT(EPOCH FROM (current_timestamp - ultimavisita)) as segundos_transcurridos
       FROM visitas 
       WHERE uid = $1 AND url = $2`,
      [uid, url]
    );
    
    if (result.rows.length === 0) {
      return null; // No existe visita previa
    }
    
    const visita = result.rows[0];
    const segundosTranscurridos = parseFloat(visita.segundos_transcurridos);
    
    return {
      existe: true,
      id: visita.id,
      ultimavisita: visita.ultimavisita,
      segundosTranscurridos,
      esReciente: segundosTranscurridos < 60 // Menos de un minuto
    };
  } catch (error) {
    console.error("Error en checkVisitaReciente:", error);
    throw error;
  }
}

// Obtener estadísticas de visitas por URL
export async function getEstadisticasVisitas(url = null) {
  try {
    let query = `
      SELECT 
        url,
        COUNT(*) as total_visitas,
        COUNT(DISTINCT uid) as visitantes_unicos,
        SUM(CASE WHEN recurrente THEN 1 ELSE 0 END) as visitas_recurrentes,
        MAX(ultimavisita) as ultima_visita
      FROM visitas
    `;
    
    let params = [];
    
    if (url) {
      query += " WHERE url = $1";
      params.push(url);
    }
    
    query += " GROUP BY url ORDER BY total_visitas DESC";
    
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en getEstadisticasVisitas:", error);
    throw error;
  }
}