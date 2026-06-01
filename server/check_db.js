const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_hUckp34fEKZY@ep-winter-lab-a819byz0-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'
});

async function check() {
  try {
    const clics = await pool.query('SELECT url, count(*) FROM clics GROUP BY url');
    console.log('CLICS BY URL:');
    console.table(clics.rows);
    
    const scrolls = await pool.query('SELECT url, count(*) FROM scrolls GROUP BY url');
    console.log('SCROLLS BY URL:');
    console.table(scrolls.rows);
    
    const stats_query = `
      SELECT 
        (SELECT COUNT(*) FROM clics) as total_clics,
        (SELECT COUNT(*) FROM scrolls) as total_scrolls,
        (SELECT COUNT(*) FROM visitas) as total_visitas
    `;
    const stats = await pool.query(stats_query);
    console.log('GENERAL STATS:');
    console.table(stats.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
