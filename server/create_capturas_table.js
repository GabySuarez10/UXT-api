const { Pool } = require("pg");
const { readFileSync } = require("fs");
const path = require("path");

const envContent = readFileSync(path.join(__dirname, ".env.local"), "utf8");
const envVars = Object.fromEntries(
  envContent.split("\n")
    .filter(line => line.includes("=") && !line.trim().startsWith("#"))
    .map(line => {
      const idx = line.indexOf("=");
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      return [key, val];
    })
);

const pool = new Pool({
  connectionString: envVars["DATABASE_URL"],
  ssl: { rejectUnauthorized: false },
});

const sql = `
  CREATE TABLE IF NOT EXISTS sitios_capturas (
    url TEXT PRIMARY KEY,
    snapshot TEXT NOT NULL,
    width INTEGER DEFAULT 1280,
    height INTEGER DEFAULT 900,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

pool.query(sql)
  .then(() => {
    console.log("✅ Tabla sitios_capturas creada exitosamente.");
    pool.end();
  })
  .catch(err => {
    console.error("❌ Error:", err.message);
    pool.end();
  });
