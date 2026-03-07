import { $ } from "bun";
import type { ChiEvent, EventTag } from "../../../src/types";

const TAG_KEYWORDS: Record<EventTag, string[]> = {
  tech: ["programming", "coding", "hackathon", "ai", "software", "developer", "data", "cyber", "cloud", "tech", "api", "machine learning", "web3", "blockchain"],
  startup: ["startup", "founder", "entrepreneur", "pitch", "venture", "incubator", "accelerator", "yc"],
  social: ["happy hour", "mixer", "meetup", "hangout", "social", "party", "brunch", "gathering"],
  arts: ["art", "gallery", "museum", "theater", "film", "photography", "design", "creative", "painting", "sculpture"],
  sports: ["run", "fitness", "yoga", "basketball", "soccer", "cycling", "workout", "marathon", "climbing", "sports"],
  food: ["food", "cooking", "restaurant", "tasting", "chef", "culinary", "dinner", "beer", "wine", "cocktail"],
  music: ["music", "concert", "dj", "live", "band", "jazz", "open mic", "karaoke"],
  networking: ["networking", "professional", "career", "industry", "conference", "summit"],
  education: ["workshop", "class", "seminar", "lecture", "training", "bootcamp", "learn", "tutorial"],
  health: ["wellness", "meditation", "mental health", "mindfulness", "nutrition", "therapy", "self-care"],
};

function classifyEvent(title: string, description: string): EventTag[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: EventTag[] = [];
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      tags.push(tag as EventTag);
    }
  }
  if (tags.length === 0) tags.push("social");
  return tags;
}

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

async function scrapeLuma(): Promise<ChiEvent[]> {
  console.error("Scraping Luma Chicago...");
  const events: ChiEvent[] = [];

  try {
    await ab("open", "https://lu.ma/chicago");
    await ab("wait", "--load", "networkidle");
    await ab("wait", "3000");
    await ab("scroll", "down", "2000");
    await ab("wait", "1500");
    await ab("scroll", "down", "2000");
    await ab("wait", "1500");

    const raw = await browserEval(import.meta.dir + "/extract-luma.js");
    let parsed: any[] = [];
    try {
      const unquoted = raw.startsWith('"') ? JSON.parse(raw) : raw;
      parsed = typeof unquoted === "string" ? JSON.parse(unquoted) : unquoted;
    } catch {
      console.error("  Failed to parse Luma extraction output");
    }

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
    await ab("wait", "--load", "networkidle");
    await ab("wait", "3000");
    await ab("scroll", "down", "2000");
    await ab("wait", "2000");
    await ab("scroll", "down", "2000");
    await ab("wait", "2000");

    const raw = await browserEval(import.meta.dir + "/extract-meetup.js");
    let parsed: any[] = [];
    try {
      const unquoted = raw.startsWith('"') ? JSON.parse(raw) : raw;
      parsed = typeof unquoted === "string" ? JSON.parse(unquoted) : unquoted;
    } catch {
      console.error("  Failed to parse Meetup extraction output");
    }

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

// Called as: bun scrape-source.ts <luma|meetup>
const source = process.argv[2];
if (source !== "luma" && source !== "meetup") {
  console.error("Usage: bun scrape-source.ts <luma|meetup>");
  process.exit(1);
}

const events = source === "luma" ? await scrapeLuma() : await scrapeMeetup();
// Output JSON to stdout for the parent process
console.log(JSON.stringify(events));
