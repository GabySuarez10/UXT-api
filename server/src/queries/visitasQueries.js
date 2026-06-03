import pool from "@/lib/db";

// ── VISITAS (lógica original intacta) ────────────────────────────────────────

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

export async function getVisitaPorUidYUrl(uid, url) {
  try {
    const result = await pool.query(
      "SELECT * FROM visitas WHERE uid = $1 AND url = $2",
      [uid, url],
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error en getVisitaPorUidYUrl:", error);
    throw error;
  }
}

export async function createVisita(data) {
  try {
    const { uid, recurrente, title, url, dominio, userAgent, referrer } = data;
    const result = await pool.query(
      `INSERT INTO visitas 
       (uid, recurrente, title, url, dominio, userAgent, referrer, ultimavisita)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [uid, recurrente, title, url, dominio, userAgent, referrer],
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error en createVisita:", error);
    throw error;
  }
}

export async function updateVisitaRecurrente(uid, url) {
  try {
    const result = await pool.query(
      `UPDATE visitas 
       SET recurrente = true, ultimavisita = current_timestamp
       WHERE uid = $1 AND url = $2
       RETURNING *`,
      [uid, url],
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error en updateVisitaRecurrente:", error);
    throw error;
  }
}

export async function checkVisitaReciente(uid, url) {
  try {
    const result = await pool.query(
      `SELECT id, ultimavisita, 
       EXTRACT(EPOCH FROM (current_timestamp - ultimavisita)) as segundos_transcurridos
       FROM visitas 
       WHERE uid = $1 AND url = $2`,
      [uid, url],
    );

    if (result.rows.length === 0) return null;

    const visita = result.rows[0];
    const segundosTranscurridos = parseFloat(visita.segundos_transcurridos);

    return {
      existe: true,
      id: visita.id,
      ultimavisita: visita.ultimavisita,
      segundosTranscurridos,
      esReciente: segundosTranscurridos < 60,
    };
  } catch (error) {
    console.error("Error en checkVisitaReciente:", error);
    throw error;
  }
}

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

// ── DASHBOARD ESTADÍSTICAS ─────────────────────────────────────────────────────

export async function getEstadisticasDashboard(
  url,
  startDate = null,
  endDate = null,
) {
  try {
    // ── Build date conditions ──
    // ── Build date conditions ──
    const visitaDateCol = "ultimavisita";
    const clicDateCol = "created_at";
    const scrollDateCol = "created_at";

    let visitaDateFilter = "";
    let clicDateFilter = "";
    let scrollDateFilter = "";
    const visitaParams = [url];
    const clicParams = [url];
    const scrollParams = [url];

    if (startDate) {
      visitaParams.push(startDate);
      visitaDateFilter += ` AND (${visitaDateCol} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date >= $${visitaParams.length}`;
      clicParams.push(startDate);
      clicDateFilter += ` AND (${clicDateCol} AT TIME ZONE 'America/Bogota')::date >= $${clicParams.length}`;
      scrollParams.push(startDate);
      scrollDateFilter += ` AND (${scrollDateCol} AT TIME ZONE 'America/Bogota')::date >= $${scrollParams.length}`;
    }
    if (endDate) {
      visitaParams.push(endDate);
      visitaDateFilter += ` AND (${visitaDateCol} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date <= $${visitaParams.length}`;
      clicParams.push(endDate);
      clicDateFilter += ` AND (${clicDateCol} AT TIME ZONE 'America/Bogota')::date <= $${clicParams.length}`;
      scrollParams.push(endDate);
      scrollDateFilter += ` AND (${scrollDateCol} AT TIME ZONE 'America/Bogota')::date <= $${scrollParams.length}`;
    }

    // ── Total visitas + recurrentes ──
    const queryVisitas = `
      SELECT 
        COUNT(*) as total_visitas,
        SUM(CASE WHEN recurrente THEN 1 ELSE 0 END) as visitas_recurrentes
      FROM visitas
      WHERE url = $1${visitaDateFilter}
    `;
    const visitasRes = await pool.query(queryVisitas, visitaParams);

    // ── Total clics ──
    const queryClics = `SELECT COUNT(*) as total_clics FROM clics WHERE url = $1${clicDateFilter}`;
    const clicsRes = await pool.query(queryClics, clicParams);

    // ── Total scrolls ──
    const queryScrolls = `SELECT COUNT(*) as total_scrolls FROM scrolls WHERE url = $1${scrollDateFilter}`;
    const scrollsRes = await pool.query(queryScrolls, scrollParams);

    // ── Average scroll depth: AVG(porcentaje_scroll) from scrolls table ──
    const queryAvgScroll = `
      SELECT COALESCE(ROUND(AVG(porcentaje_scroll)), 0) as avg_scroll
      FROM scrolls WHERE url = $1${scrollDateFilter}
    `;
    const avgScrollRes = await pool.query(queryAvgScroll, scrollParams);
    const porcentajeScroll = parseInt(
      avgScrollRes.rows[0]?.avg_scroll || 0,
      10,
    );

    return {
      visitas: parseInt(visitasRes.rows[0]?.total_visitas || 0, 10),
      recurrentes: parseInt(visitasRes.rows[0]?.visitas_recurrentes || 0, 10),
      clics: parseInt(clicsRes.rows[0]?.total_clics || 0, 10),
      scrolls: parseInt(scrollsRes.rows[0]?.total_scrolls || 0, 10),
      porcentajeScroll,
    };
  } catch (error) {
    console.error("Error en getEstadisticasDashboard:", error);
    throw error;
  }
}

// ── TENDENCIAS DIARIAS (para gráficas de línea) ────────────────────────────────

export async function getTendenciasDiarias(url, startDate, endDate) {
  try {
    const clicScrollParams = [url];
    const visitaParams = [url];
    let clicScrollFilter = "";
    let visitaFilter = "";

    if (startDate) {
      clicScrollParams.push(startDate);
      clicScrollFilter += ` AND (created_at AT TIME ZONE 'America/Bogota')::date >= $${clicScrollParams.length}`;

      visitaParams.push(startDate);
      visitaFilter += ` AND (ultimavisita AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date >= $${visitaParams.length}`;
    }
    if (endDate) {
      clicScrollParams.push(endDate);
      clicScrollFilter += ` AND (created_at AT TIME ZONE 'America/Bogota')::date <= $${clicScrollParams.length}`;

      visitaParams.push(endDate);
      visitaFilter += ` AND (ultimavisita AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date <= $${visitaParams.length}`;
    }

    const queryClics = `
      SELECT (created_at AT TIME ZONE 'America/Bogota')::date as fecha, COUNT(*) as total
      FROM clics WHERE url = $1${clicScrollFilter}
      GROUP BY fecha ORDER BY fecha
    `;
    const queryScrolls = `
      SELECT (created_at AT TIME ZONE 'America/Bogota')::date as fecha, COUNT(*) as total
      FROM scrolls WHERE url = $1${clicScrollFilter}
      GROUP BY fecha ORDER BY fecha
    `;
    const queryVisitas = `
      SELECT (ultimavisita AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date as fecha, COUNT(*) as total
      FROM visitas WHERE url = $1${visitaFilter}
      GROUP BY fecha ORDER BY fecha
    `;

    const [clicsRes, scrollsRes, visitasRes] = await Promise.all([
      pool.query(queryClics, clicScrollParams),
      pool.query(queryScrolls, clicScrollParams),
      pool.query(queryVisitas, visitaParams),
    ]);

    const format = (rows) =>
      rows.map((r) => ({
        fecha: r.fecha,
        total: parseInt(r.total, 10),
      }));

    return {
      clics: format(clicsRes.rows),
      scrolls: format(scrollsRes.rows),
      visitas: format(visitasRes.rows),
    };
  } catch (error) {
    console.error("Error en getTendenciasDiarias:", error);
    throw error;
  }
}

// ── CLICS ────────────────────────────────────────────────────────────────────

export async function getClics(url = null) {
  try {
    let query = "SELECT * FROM clics ORDER BY created_at DESC";
    let params = [];

    if (url) {
      query = "SELECT * FROM clics WHERE url = $1 ORDER BY created_at DESC";
      params.push(url);
    }

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en getClics:", error);
    throw error;
  }
}

export async function createClic(data) {
  try {
    const { uid, url, dominio, elemento, posicion_x, posicion_y, timestamp, viewport_width, viewport_height } =
      data;
    const result = await pool.query(
      `INSERT INTO clics 
       (uid, url, dominio, elemento, posicion_x, posicion_y, timestamp, viewport_width, viewport_height)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [uid, url, dominio, elemento, posicion_x, posicion_y, timestamp, viewport_width || null, viewport_height || null],
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error en createClic:", error);
    throw error;
  }
}

// ── SCROLLS ──────────────────────────────────────────────────────────────────

export async function getScrolls(url = null) {
  try {
    let query = "SELECT * FROM scrolls ORDER BY created_at DESC";
    let params = [];

    if (url) {
      query = "SELECT * FROM scrolls WHERE url = $1 ORDER BY created_at DESC";
      params.push(url);
    }

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en getScrolls:", error);
    throw error;
  }
}

export async function createScroll(data) {
  try {
    const {
      uid,
      url,
      dominio,
      scroll_x,
      scroll_y,
      porcentaje_scroll,
      timestamp,
    } = data;
    const result = await pool.query(
      `INSERT INTO scrolls 
       (uid, url, dominio, scroll_x, scroll_y, porcentaje_scroll, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [uid, url, dominio, scroll_x, scroll_y, porcentaje_scroll, timestamp],
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error en createScroll:", error);
    throw error;
  }
}
