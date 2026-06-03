const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_hUckp34fEKZY@ep-winter-lab-a819byz0-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
});

async function run() {
  try {
    const res = await pool.query(
      `SELECT column_name, data_type, character_maximum_length 
       FROM information_schema.columns 
       WHERE table_name = 'feedback'`
    );
    console.log("COLUMNS:");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
