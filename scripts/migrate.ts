import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Falta DATABASE_URL. Añádela a .env.local o al entorno de Neon.");
  process.exit(1);
}

function splitSqlStatements(source: string): string[] {
  const statements: string[] = [];
  let start = 0;
  let state: "normal" | "single" | "double" | "line" | "block" | { delimiter: string } = "normal";
  for (let i = 0; i < source.length; i += 1) {
    const current = source[i];
    const next = source[i + 1];
    if (typeof state === "object") {
      if (source.startsWith(state.delimiter, i)) { i += state.delimiter.length - 1; state = "normal"; }
      continue;
    }
    if (state === "line") { if (current === "\n") state = "normal"; continue; }
    if (state === "block") { if (current === "*" && next === "/") { i += 1; state = "normal"; } continue; }
    if (state === "single") { if (current === "'" && next === "'") { i += 1; continue; } if (current === "'") state = "normal"; continue; }
    if (state === "double") { if (current === '"' && next === '"') { i += 1; continue; } if (current === '"') state = "normal"; continue; }
    if (current === "-" && next === "-") { i += 1; state = "line"; continue; }
    if (current === "/" && next === "*") { i += 1; state = "block"; continue; }
    if (current === "'") { state = "single"; continue; }
    if (current === '"') { state = "double"; continue; }
    if (current === "$") {
      const match = source.slice(i).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);
      if (match) { state = { delimiter: match[0] }; i += match[0].length - 1; continue; }
    }
    if (current === ";") {
      const statement = source.slice(start, i).trim();
      if (statement) statements.push(statement);
      start = i + 1;
    }
  }
  const finalStatement = source.slice(start).trim();
  if (finalStatement) statements.push(finalStatement);
  return statements;
}

async function main() {
  const sql = neon(connectionString as string);
  const migrationDir = resolve(process.cwd(), "db/migrations");
  const files = (await readdir(migrationDir))
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b, "en"));

  for (const file of files) {
    const migration = await readFile(resolve(migrationDir, file), "utf8");
    const statements = splitSqlStatements(migration);
    await sql.transaction((tx) => statements.map((statement) => tx.query(statement)));
    console.log(`✓ ${file}`);
  }
  console.log("Base de datos Neon preparada correctamente.");
}

main().catch((error: unknown) => {
  console.error("No se pudo ejecutar la migración:", error);
  process.exit(1);
});
