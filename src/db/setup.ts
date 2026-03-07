import db from "./index";

async function setup() {
  const schema = await Bun.file(
    import.meta.dir + "/schema.sql"
  ).text();

  await db.unsafe(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
  `);
  console.log("Dropped existing schema.");

  await db.unsafe(schema);
  console.log("Database schema applied successfully.");
  process.exit(0);
}

setup().catch((err) => {
  console.error("Failed to apply schema:", err);
  process.exit(1);
});
