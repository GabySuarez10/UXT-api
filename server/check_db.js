const { Pool } = require("pg");
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_hUckp34fEKZY@ep-winter-lab-a819byz0-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
});

async function check() {
  try {
    console.log("Running migration...");
    await pool.query(
      "ALTER TABLE clics ADD COLUMN IF NOT EXISTS viewport_width INTEGER, ADD COLUMN IF NOT EXISTS viewport_height INTEGER"
    );
    console.log("Migration finished successfully!");

    const clicsColumns = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sitios'"
    );
    console.log("CLICS COLUMNS:");
    console.table(clicsColumns.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
