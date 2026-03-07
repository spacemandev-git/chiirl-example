import db from "../../../src/db";
import type { ChiEvent } from "../../../src/types";

async function scrapeSource(source: "luma" | "meetup"): Promise<ChiEvent[]> {
  const scriptPath = import.meta.dir + "/scrape-source.ts";
  const proc = Bun.spawn(["bun", scriptPath, source], {
    stdout: "pipe",
    stderr: "inherit",
    env: { ...process.env, AGENT_BROWSER_SESSION: `scrape-${source}` },
  });
  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  const lines = stdout.trim().split("\n");
  const jsonLine = lines[lines.length - 1]!;
  return JSON.parse(jsonLine);
}

async function upsertEvents(events: ChiEvent[]): Promise<number> {
  let upserted = 0;

  for (const event of events) {
    try {
      await db`
        INSERT INTO events (title, description, url, source, source_id, start_time, end_time, location, image_url, tags, updated_at)
        VALUES (
          ${event.title},
          ${event.description},
          ${event.url},
          ${event.source},
          ${event.source_id},
          ${new Date(event.start_time)},
          ${event.end_time ? new Date(event.end_time) : null},
          ${event.location || null},
          ${event.image_url || null},
          ${`{${event.tags.join(",")}}`},
          NOW()
        )
        ON CONFLICT (source, source_id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          url = EXCLUDED.url,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time,
          location = EXCLUDED.location,
          image_url = EXCLUDED.image_url,
          tags = EXCLUDED.tags,
          updated_at = NOW()
      `;
      upserted++;
    } catch (err) {
      console.error(`  Failed to upsert event "${event.title}":`, err);
    }
  }

  return upserted;
}

async function main() {
  console.log("Starting parallel event scrape...\n");

  const [lumaEvents, meetupEvents] = await Promise.all([
    scrapeSource("luma"),
    scrapeSource("meetup"),
  ]);

  console.log(`Luma: ${lumaEvents.length} events`);
  console.log(`Meetup: ${meetupEvents.length} events`);

  const allEvents = [...lumaEvents, ...meetupEvents];
  console.log(`Total: ${allEvents.length} events\n`);

  const upserted = await upsertEvents(allEvents);
  console.log(`Events upserted: ${upserted}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Scrape failed:", err);
  process.exit(1);
});
