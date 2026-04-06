import db from "../../../src/db";
import type { ChiEvent } from "../../../src/types";

type ScrapableSource = "luma" | "meetup" | "eventbrite" | "pie";

const ALL_SOURCES: ScrapableSource[] = ["luma", "meetup", "eventbrite", "pie"];
const THREE_WEEKS_MS = 21 * 24 * 60 * 60 * 1000;

async function scrapeSource(source: ScrapableSource): Promise<ChiEvent[]> {
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

function filterToNextThreeWeeks(events: ChiEvent[]): ChiEvent[] {
  const now = Date.now();
  const cutoff = now + THREE_WEEKS_MS;
  return events.filter((e) => {
    const t = new Date(e.start_time).getTime();
    return t >= now && t <= cutoff;
  });
}

async function markPastEvents(): Promise<number> {
  const result = await db`
    UPDATE events SET status = 'past'
    WHERE status = 'approved' AND start_time < NOW()
  `;
  return result.count;
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

export async function scrape() {
  console.log("Starting parallel event scrape...\n");

  const results = await Promise.all(
    ALL_SOURCES.map((source) => scrapeSource(source))
  );

  const allEvents: ChiEvent[] = [];
  for (let i = 0; i < ALL_SOURCES.length; i++) {
    const sourceEvents = results[i]!;
    console.log(`${ALL_SOURCES[i]}: ${sourceEvents.length} events`);
    allEvents.push(...sourceEvents);
  }

  const filtered = filterToNextThreeWeeks(allEvents);
  console.log(`\nTotal scraped: ${allEvents.length}`);
  console.log(`Within next 3 weeks: ${filtered.length}\n`);

  const upserted = await upsertEvents(filtered);
  console.log(`Events upserted: ${upserted}`);

  // Mark events that have already passed
  const pastCount = await markPastEvents();
  console.log(`Events marked as past: ${pastCount}`);
}

// Allow running directly
if (import.meta.main) {
  scrape()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Scrape failed:", err);
      process.exit(1);
    });
}
