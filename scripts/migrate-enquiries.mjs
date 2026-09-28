import { readFile } from "node:fs/promises";
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

  const migration = await readFile(
    new URL("../db/migrations/001_project_enquiries.sql", import.meta.url),
    "utf8",
  );
  // Explicit delimiters keep SQL parsing out of this runner (including quoted semicolons).
  const statements = migration.split(/^--> statement-breakpoint\s*$/m)
    .map((statement) => statement.trim()).filter(Boolean);
  const sql = neon(connectionString, {
    fetchOptions: { signal: AbortSignal.timeout(30_000) },
  });
  await sql.transaction(statements.map((statement) => sql.query(statement)));
  console.log("Enquiry migration applied: 001_project_enquiries.sql");
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
