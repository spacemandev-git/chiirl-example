import db from "./index";

const MIGRATIONS_MARKER = "-- === MIGRATIONS ===";

/**
 * Split SQL into individual statements, respecting DO $$ ... END $$; blocks.
 */
function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inDollarBlock = false;

  for (const line of sql.split("\n")) {
    const trimmed = line.trim();

    // Skip pure comment lines and empty lines
    if (trimmed.startsWith("--") || trimmed === "") {
      continue;
    }

    // Track DO $$ blocks
    if (/^DO\s+\$\$/i.test(trimmed)) {
      inDollarBlock = true;
    }

    current += line + "\n";

    if (inDollarBlock) {
      if (/END\s+\$\$\s*;/i.test(trimmed)) {
        inDollarBlock = false;
        statements.push(current.trim());
        current = "";
      }
    } else if (trimmed.endsWith(";")) {
      statements.push(current.trim());
      current = "";
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements.filter((s) => s.length > 0);
}

async function setup() {
  const schema = await Bun.file(
    import.meta.dir + "/schema.sql"
  ).text();

  await db.unsafe(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
  `);
  console.log("Dropped existing schema.");

  // Split schema into core DDL and migrations
  const markerIndex = schema.indexOf(MIGRATIONS_MARKER);
  const coreDDL = markerIndex >= 0 ? schema.slice(0, markerIndex) : schema;
  const migrations = markerIndex >= 0 ? schema.slice(markerIndex + MIGRATIONS_MARKER.length) : "";

  // Run core DDL in one batch
  await db.unsafe(coreDDL);
  console.log("Core schema applied.");

  // Run each migration statement individually (needed for ALTER TYPE ADD VALUE etc.)
  if (migrations.trim()) {
    const statements = splitStatements(migrations);

    for (const stmt of statements) {
      try {
        await db.unsafe(stmt);
      } catch (err: any) {
        // Ignore "already exists" / "duplicate" errors for idempotent migrations
        if (err.message?.includes("already exists") || err.message?.includes("duplicate")) {
          continue;
        }
        console.warn(`Migration warning: ${err.message}`);
      }
    }
    console.log(`Ran ${statements.length} migration statements.`);
  }

  console.log("Database setup complete.");
  process.exit(0);
}

setup().catch((err) => {
  console.error("Failed to apply schema:", err);
  process.exit(1);
});
