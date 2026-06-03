const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_hUckp34fEKZY@ep-winter-lab-a819byz0-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
});

async function run() {
  try {
    const res = await pool.query(
      `SELECT conname, pg_get_constraintdef(c.oid) 
       FROM pg_constraint c 
       JOIN pg_namespace n ON n.oid = c.connamespace 
       WHERE conrelid = 'feedback'::regclass`
    );
    console.log("CONSTRAINTS:");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
