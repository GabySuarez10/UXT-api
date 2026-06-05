import pkg from "pg";
import { readFileSync } from "fs";

const envContent = readFileSync(".env.local", "utf8");
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

const { Pool } = pkg;
const pool = new Pool({
  connectionString: envVars["DATABASE_URL"],
  ssl: { rejectUnauthorized: false },
});

pool.query("SELECT url, width, height, created_at FROM sitios_capturas")
  .then(res => {
    console.log("Registros en sitios_capturas:", res.rows);
  })
  .catch(console.error)
  .finally(() => pool.end());
