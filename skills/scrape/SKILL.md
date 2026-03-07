---
name: scrape
description: Scrapes events from Luma Chicago and Meetup Chicago calendars, classifies them with tags, and stores them in the Postgres database. Run this skill to fetch and update the events database.
compatibility: Requires docker (postgres), bun, agent-browser (with Chromium), and internet access
allowed-tools: Bash(bun:*) Read
---

# Scrape Skill

Fetches events from Chicago event calendars and stores them in the database.

## Sources

1. **Luma** - `https://lu.ma/chicago`
2. **Meetup** - `https://www.meetup.com/find/?source=EVENTS&eventType=inPerson&sortField=DATETIME&location=us--il--Chicago`

## Steps

1. Run the scrape script:
   ```bash
   bun run skills/scrape/scripts/scrape.ts
   ```

2. The script will:
   - Launch a headless browser using agent-browser
   - Navigate to both Luma and Meetup Chicago pages
   - Extract event data (title, description, URL, time, location)
   - Classify each event with tags from the enum: tech, startup, social, arts, sports, food, music, networking, education, health
   - Upsert events into the Postgres `events` table (deduplicating by source + source_id)

## Tag Classification

Tags are assigned by analyzing the event title and description against keywords:
- **tech**: programming, coding, hackathon, AI, software, developer, data, cyber, cloud
- **startup**: startup, founder, entrepreneur, pitch, venture, incubator
- **social**: happy hour, mixer, meetup, hangout, social, party, brunch
- **arts**: art, gallery, museum, theater, film, photography, design, creative
- **sports**: run, fitness, yoga, basketball, soccer, cycling, workout, marathon
- **food**: food, cooking, restaurant, tasting, chef, culinary, dinner
- **music**: music, concert, DJ, live, band, jazz, open mic
- **networking**: networking, professional, career, industry, conference
- **education**: workshop, class, seminar, lecture, training, bootcamp, learn
- **health**: wellness, meditation, mental health, mindfulness, nutrition

## Output

Logs the number of events scraped and inserted/updated per source.
