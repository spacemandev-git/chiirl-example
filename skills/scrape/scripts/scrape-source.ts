import { $ } from "bun";
import { classifyEvent } from "../../../src/types";
import type { ChiEvent } from "../../../src/types";

async function ab(...args: string[]): Promise<string> {
  try {
    const result = await $`npx agent-browser ${args}`.quiet().text();
    return result.trim();
  } catch (err: any) {
    if (err?.stderr?.includes("Timeout")) {
      console.error(`  (timeout on: ${args.join(" ")}, continuing...)`);
      return "";
    }
    throw err;
  }
}

async function browserEval(jsFile: string): Promise<string> {
  const script = await Bun.file(jsFile).text();
  const oneLine = script
    .replace(/\/\/.*$/gm, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const result = await $`npx agent-browser eval ${oneLine}`.quiet().text();
  return result.trim();
}

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_SCROLLS = 30; // safety cap

function parseFuzzyTime(timeStr: string): Date {
  const now = new Date();
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]!);
    const minutes = parseInt(timeMatch[2]!);
    const ampm = timeMatch[3]!.toUpperCase();
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    now.setHours(hours, minutes, 0, 0);
  }
  return now;
}

function parseDateText(dateText: string): Date {
  const now = new Date();
  const timeMatch = dateText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let hours = 0, minutes = 0;
  if (timeMatch) {
    hours = parseInt(timeMatch[1]!);
    minutes = parseInt(timeMatch[2]!);
    const ampm = timeMatch[3]!.toUpperCase();
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }

  const dateMatch = dateText.match(/([A-Za-z]+),?\s+([A-Za-z]+)\s+(\d{1,2})/);
  if (dateMatch) {
    const monthStr = dateMatch[2]!.toLowerCase();
    const day = parseInt(dateMatch[3]!);
    const months: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    const month = months[monthStr.slice(0, 3)];
    if (month !== undefined) {
      const date = new Date(now.getFullYear(), month, day, hours, minutes);
      if (date.getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000) {
        date.setFullYear(date.getFullYear() + 1);
      }
      return date;
    }
  }

  const parsed = new Date(dateText);
  if (!isNaN(parsed.getTime())) return parsed;

  now.setHours(hours, minutes, 0, 0);
  return now;
}

function parseRawJson(raw: string, sourceName: string): any[] {
  try {
    const unquoted = raw.startsWith('"') ? JSON.parse(raw) : raw;
    return typeof unquoted === "string" ? JSON.parse(unquoted) : unquoted;
  } catch {
    console.error(`  Failed to parse ${sourceName} extraction output`);
    return [];
  }
}

/** Returns true if ANY event in the batch is beyond the 14-day cutoff */
function hasBeyondCutoff(dates: Date[]): boolean {
  const cutoff = Date.now() + FOURTEEN_DAYS_MS;
  return dates.some((d) => d.getTime() > cutoff);
}

/**
 * Scroll-and-extract loop. Opens the page, then scrolls until the extraction
 * script returns an event past 14 days from today (or hits MAX_SCROLLS).
 * Returns the final parsed extraction array.
 */
async function scrollUntilCutoff(
  extractScript: string,
  parseDates: (items: any[]) => Date[],
  opts: { initialWait?: number; scrollPx?: number; scrollWait?: number } = {},
): Promise<any[]> {
  const { initialWait = 3000, scrollPx = 2000, scrollWait = 2000 } = opts;

  await ab("wait", "--load", "networkidle");
  await ab("wait", String(initialWait));

  let parsed: any[] = [];
  let prevCount = 0;

  for (let i = 0; i < MAX_SCROLLS; i++) {
    await ab("scroll", "down", String(scrollPx));
    await ab("wait", String(scrollWait));

    const raw = await browserEval(extractScript);
    parsed = parseRawJson(raw, extractScript);

    const dates = parseDates(parsed);
    const newCount = parsed.length;

    console.error(`    scroll ${i + 1}: ${newCount} events extracted`);

    // Stop if we found an event beyond 14 days
    if (hasBeyondCutoff(dates)) {
      console.error(`    reached 14-day cutoff, stopping scrolls`);
      break;
    }

    // Stop if no new events loaded (page exhausted)
    if (newCount > 0 && newCount === prevCount) {
      console.error(`    no new events after scroll, stopping`);
      break;
    }

    prevCount = newCount;
  }

  return parsed;
}

async function scrapeLuma(): Promise<ChiEvent[]> {
  console.error("Scraping Luma Chicago...");
  const events: ChiEvent[] = [];

  try {
    await ab("open", "https://lu.ma/chicago");

    const parsed = await scrollUntilCutoff(
      import.meta.dir + "/extract-luma.js",
      (items) => items.map((i: any) => i.time ? parseFuzzyTime(i.time) : new Date()),
    );

    console.error(`  Found ${parsed.length} raw events from Luma`);
    for (const item of parsed) {
      if (!item.title || !item.slug) continue;
      const tags = classifyEvent(item.title, item.description || "");
      events.push({
        title: item.title,
        description: item.description || "",
        url: `https://lu.ma/${item.slug}`,
        source: "luma",
        source_id: item.slug,
        start_time: item.time ? parseFuzzyTime(item.time) : new Date(),
        location: item.location || "Chicago, IL",
        image_url: item.image_url || undefined,
        tags,
      });
    }
  } catch (err) {
    console.error("Error scraping Luma:", err);
  }

  try { await ab("close"); } catch {}
  console.error(`  Processed ${events.length} Luma events`);
  return events;
}

async function scrapeMeetup(): Promise<ChiEvent[]> {
  console.error("Scraping Meetup Chicago...");
  const events: ChiEvent[] = [];

  try {
    await ab("open", "https://www.meetup.com/find/?source=EVENTS&eventType=inPerson&sortField=DATETIME&location=us--il--Chicago");

    const parsed = await scrollUntilCutoff(
      import.meta.dir + "/extract-meetup.js",
      (items) => items.map((i: any) =>
        i.datetime ? new Date(i.datetime.replace(/\[.*\]/, "")) : parseFuzzyTime(i.time || "")
      ),
    );

    console.error(`  Found ${parsed.length} raw events from Meetup`);
    for (const item of parsed) {
      if (!item.title || !item.href) continue;
      const urlMatch = item.href.match(/\/events\/(\d+)/);
      const sourceId = urlMatch ? urlMatch[1] : item.href;
      const fullUrl = item.href.startsWith("http") ? item.href : `https://www.meetup.com${item.href}`;
      const tags = classifyEvent(item.title, "");
      events.push({
        title: item.title,
        description: "",
        url: fullUrl,
        source: "meetup",
        source_id: sourceId,
        start_time: item.datetime ? new Date(item.datetime.replace(/\[.*\]/, "")) : parseFuzzyTime(item.time || ""),
        location: item.location || "Chicago, IL",
        image_url: item.image_url || undefined,
        tags,
      });
    }
  } catch (err) {
    console.error("Error scraping Meetup:", err);
  }

  try { await ab("close"); } catch {}
  console.error(`  Processed ${events.length} Meetup events`);
  return events;
}

async function scrapeEventbrite(): Promise<ChiEvent[]> {
  console.error("Scraping Eventbrite Chicago...");
  const events: ChiEvent[] = [];

  try {
    await ab("open", "https://www.eventbrite.com/d/il--chicago/all-events/");

    const parsed = await scrollUntilCutoff(
      import.meta.dir + "/extract-eventbrite.js",
      (items) => items.map((i: any) => i.date_text ? parseDateText(i.date_text) : new Date()),
    );

    console.error(`  Found ${parsed.length} raw events from Eventbrite`);
    for (const item of parsed) {
      if (!item.title || !item.href) continue;
      const urlMatch = item.href.match(/eventbrite\.com\/e\/([^/?]+)/);
      const sourceId = urlMatch ? urlMatch[1] : item.href;
      const fullUrl = item.href.startsWith("http") ? item.href : `https://www.eventbrite.com${item.href}`;
      const tags = classifyEvent(item.title, "");
      events.push({
        title: item.title,
        description: "",
        url: fullUrl,
        source: "eventbrite",
        source_id: sourceId,
        start_time: item.date_text ? parseDateText(item.date_text) : new Date(),
        location: item.location || "Chicago, IL",
        image_url: item.image_url || undefined,
        tags,
      });
    }
  } catch (err) {
    console.error("Error scraping Eventbrite:", err);
  }

  try { await ab("close"); } catch {}
  console.error(`  Processed ${events.length} Eventbrite events`);
  return events;
}

async function scrapePie(): Promise<ChiEvent[]> {
  console.error("Scraping Pie Chicago...");
  const events: ChiEvent[] = [];

  try {
    await ab("open", "https://www.getpie.app/?city=chicago");

    const parsed = await scrollUntilCutoff(
      import.meta.dir + "/extract-pie.js",
      (items) => items.map((i: any) => i.date_text ? parseDateText(i.date_text) : new Date()),
      { initialWait: 6000, scrollPx: 1500, scrollWait: 3000 }, // SPA needs longer waits
    );

    console.error(`  Found ${parsed.length} raw events from Pie`);
    for (const item of parsed) {
      if (!item.title || !item.href) continue;
      const slugMatch = item.href.match(/\/p(?:lans?)?\/([^/?]+)/);
      const sourceId = slugMatch ? slugMatch[1] : item.href;
      const fullUrl = item.href.startsWith("http") ? item.href : `https://www.getpie.app${item.href}`;
      const tags = classifyEvent(item.title, "");
      events.push({
        title: item.title,
        description: "",
        url: fullUrl,
        source: "pie",
        source_id: sourceId,
        start_time: item.date_text ? parseDateText(item.date_text) : new Date(),
        location: item.location || "Chicago, IL",
        image_url: item.image_url || undefined,
        tags,
      });
    }
  } catch (err) {
    console.error("Error scraping Pie:", err);
  }

  try { await ab("close"); } catch {}
  console.error(`  Processed ${events.length} Pie events`);
  return events;
}

// Called as: bun scrape-source.ts <luma|meetup|eventbrite|pie>
const source = process.argv[2];
const scrapers: Record<string, () => Promise<ChiEvent[]>> = {
  luma: scrapeLuma,
  meetup: scrapeMeetup,
  eventbrite: scrapeEventbrite,
  pie: scrapePie,
};

if (!source || !scrapers[source]) {
  console.error("Usage: bun scrape-source.ts <luma|meetup|eventbrite|pie>");
  process.exit(1);
}

const events = await scrapers[source]!();
// Output JSON to stdout for the parent process
console.log(JSON.stringify(events));
