import { scrape } from "./skills/scrape/scripts/scrape";
import { broadcast } from "./skills/broadcast/scripts/broadcast";
import { pushNotify } from "./skills/broadcast/scripts/push-notify";
import "./src/server"; // starts the health check server

function runJob(name: string, fn: () => Promise<void>) {
  console.log(`[cron] Running ${name}...`);
  fn()
    .then(() => console.log(`[cron] ${name} completed`))
    .catch((err) => console.error(`[cron] ${name} failed:`, err));
}

// --- Cron scheduling ---
let lastScrapeHour = -1;
let lastBroadcastDay = -1;

const SCRAPE_INTERVAL_HOURS = 6;
const BROADCAST_HOUR_UTC = 14; // 8am CT = 14:00 UTC

setInterval(() => {
  const now = new Date();
  const hour = now.getUTCHours();
  const day = now.getUTCDate();

  // Scrape every 6 hours
  if (hour % SCRAPE_INTERVAL_HOURS === 0 && hour !== lastScrapeHour) {
    lastScrapeHour = hour;
    runJob("scrape", scrape);
  }

  // Broadcast once daily at 8am CT — email + push in parallel
  if (hour === BROADCAST_HOUR_UTC && day !== lastBroadcastDay) {
    lastBroadcastDay = day;
    runJob("broadcast", async () => {
      await Promise.all([broadcast(), pushNotify()]);
    });
  }
}, 60_000);

console.log(`[cron] Scrape scheduled every ${SCRAPE_INTERVAL_HOURS}h (UTC 0,6,12,18)`);
console.log(`[cron] Broadcast scheduled daily at ${BROADCAST_HOUR_UTC}:00 UTC (8am CT)`);

// Run an initial scrape on startup
runJob("scrape (startup)", scrape);
