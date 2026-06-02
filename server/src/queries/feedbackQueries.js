import pool from "@/lib/db.js";

export async function createFeedback({ response, session_id, page_url, comment, event_type }) {
  // event_type in database is VARCHAR(50). Slice to avoid "value too long" errors.
  const truncatedEventType = event_type ? event_type.slice(0, 50) : null;

  const query = `
    INSERT INTO feedback (timestamp, response, session_id, page_url, comment, event_type)
    VALUES (NOW(), $1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await pool.query(query, [
    response,
    session_id,
    page_url,
    comment,
    truncatedEventType
  ]);
  return result.rows[0];
}

export async function getFeedbackByUrl(url) {
  let query = "SELECT * FROM feedback";
  const params = [];
  if (url) {
    query += " WHERE page_url = $1";
    params.push(url);
  }
  query += " ORDER BY timestamp DESC";
  const result = await pool.query(query, params);
  return result.rows;
}
