import sql from "../src/db";

const PHONE = "+1";

const sampleUsers = [
  { name: "Alice", tags: ["tech", "startup", "networking"] },
  { name: "Bob", tags: ["music", "arts", "social"] },
  { name: "Charlie", tags: ["food", "health", "education"] },
];

for (const user of sampleUsers) {
  await sql`
    INSERT INTO users (phone, name, tags)
    VALUES (${PHONE}, ${user.name}, ${`{${user.tags.join(",")}}`}::event_tag[])
  `;
  console.log(`Inserted user: ${user.name} with tags: ${user.tags.join(", ")}`);
}

console.log("Done!");
process.exit(0);
