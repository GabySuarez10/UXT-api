const { Pool } = require("pg");
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_hUckp34fEKZY@ep-winter-lab-a819byz0-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
});

async function fix() {
  try {
    console.log("Ampliando columna response de VARCHAR(10) a VARCHAR(50)...");
    await pool.query(
      "ALTER TABLE feedback ALTER COLUMN response TYPE VARCHAR(50)"
    );
    console.log("✅ Columna 'response' ampliada exitosamente.");

    // Verificar
    const cols = await pool.query(
      "SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'feedback'"
    );
    console.log("\nColumnas actualizadas de feedback:");
    console.table(cols.rows);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

fix();
