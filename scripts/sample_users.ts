import sql from "../src/db";

const sampleUsers = [
  { name: "Alice", email: "alice@example.com", tags: ["code-engineering", "fundraising", "networking"] },
  { name: "Bob", email: "bob@example.com", tags: ["hangout", "product", "uiux-cx"] },
  { name: "Charlie", email: "charlie@example.com", tags: ["marketing", "sales", "scaling"] },
];

for (const user of sampleUsers) {
  await sql`
    INSERT INTO users (email, name, tags)
    VALUES (${user.email}, ${user.name}, ${`{${user.tags.join(",")}}`}::event_tag[])
    ON CONFLICT (email) DO NOTHING
  `;
  console.log(`Inserted user: ${user.name} (${user.email}) with tags: ${user.tags.join(", ")}`);
}

console.log("Done!");
process.exit(0);
