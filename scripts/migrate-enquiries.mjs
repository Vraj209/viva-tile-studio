import { readFile, readdir } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

// Run with Node's --env-file option so credentials never enter source or CLI arguments.
const connectionString = process.env.DATABASE_URL_UNPOOLED;

async function migrate() {
  if (!connectionString) {
    throw new Error("Set DATABASE_URL_UNPOOLED before running the enquiry migration.");
  }
  const url = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.hostname.includes('-pooler')) {
    throw new Error("Migrations require a direct Postgres connection in DATABASE_URL_UNPOOLED.");
  }

  const sql = neon(connectionString, {
    fetchOptions: { signal: AbortSignal.timeout(30_000) },
  });
  const directory = new URL("../db/migrations/", import.meta.url);
  const files = (await readdir(directory)).filter((name) => /^\d+.*\.sql$/.test(name)).sort();
  for (const file of files) {
    const migration = await readFile(new URL(file, directory), "utf8");
    // Each migration is repeatable and applied atomically, in numeric order.
    const statements = migration.split(/^--> statement-breakpoint\s*$/m)
      .map((statement) => statement.trim()).filter(Boolean);
    await sql.transaction(statements.map((statement) => sql.query(statement)));
    console.log(`Enquiry migration applied: ${file}`);
  }
}

migrate().catch((error) => {
  // Do not print connection details, statements, or returned data.
  if (!connectionString || (error instanceof Error && error.message.startsWith("Migrations require"))) {
    console.error(error.message);
  } else {
    console.error("Enquiry migration failed. Check the direct database credentials and schema access.");
  }
  process.exitCode = 1;
});
