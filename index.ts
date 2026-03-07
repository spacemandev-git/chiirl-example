import { scrape } from "./skills/scrape/scripts/scrape";
import { broadcast } from "./skills/broadcast/scripts/broadcast";
import "./src/server"; // starts the redirect/click-tracking server

function runJob(name: string, fn: () => Promise<void>) {
  console.log(`[cron] Running ${name}...`);
  fn()
    .then(() => console.log(`[cron] ${name} completed`))
    .catch((err) => console.error(`[cron] ${name} failed:`, err));
}

// --- Cron scheduling ---
// Check every minute, fire jobs at the right times
let lastScrapeHour = -1;
let lastBroadcastDay = -1;

const SCRAPE_INTERVAL_HOURS = 6; // Run scrape every 6 hours (0, 6, 12, 18)
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

  // Broadcast once daily at 8am CT
  if (hour === BROADCAST_HOUR_UTC && day !== lastBroadcastDay) {
    lastBroadcastDay = day;
    runJob("broadcast", broadcast);
  }
}, 60_000); // check every minute

console.log(`[cron] Scrape scheduled every ${SCRAPE_INTERVAL_HOURS}h (UTC 0,6,12,18)`);
console.log(`[cron] Broadcast scheduled daily at ${BROADCAST_HOUR_UTC}:00 UTC (8am CT)`);

// Run an initial scrape on startup
runJob("scrape (startup)", scrape);
