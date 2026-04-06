export const EVENT_TAGS = [
  // Event format
  "co-working",
  "discussion",
  "hangout",
  "networking",
  "pitching-demo",
  "speaker-panel",
  // Topics
  "branding",
  "business-strategy",
  "capital-deployment",
  "code-engineering",
  "finance",
  "fundraising",
  "gtm",
  "legal-ip",
  "marketing",
  "org-management",
  "recruiting",
  "product",
  "pitching-howto",
  "policy",
  "sales",
  "scaling",
  "uiux-cx",
  // Business stage
  "concept",
  "pre-seed",
  "seed",
  "series-a",
  "growth",
  "late-stage",
] as const;

export type EventTag = (typeof EVENT_TAGS)[number];

export type NotificationPreference = "email" | "push" | "both" | "none";

export type DigestFrequency = "daily" | "weekly" | "monthly" | "none";

export type EventStatus = "approved" | "pending" | "rejected" | "past";

export interface ChiEvent {
  id?: number;
  title: string;
  description: string;
  url: string;
  source: "luma" | "meetup" | "eventbrite" | "pie" | "user";
  source_id: string;
  start_time: Date;
  end_time?: Date;
  location?: string;
  image_url?: string;
  tags: EventTag[];
  status: EventStatus;
  submitted_by?: number | null;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  tags: EventTag[];
  notification_preference: NotificationPreference;
  email_frequency: DigestFrequency;
  push_frequency: DigestFrequency;
  last_email_digest_at?: Date;
  last_push_digest_at?: Date;
  last_test_digest_at?: Date;
}

export interface Click {
  id: number;
  user_id: number | null;
  event_id: number;
  source: "pwa" | "email";
  clicked_at: Date;
}

export interface PushSubscription {
  id: number;
  user_id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: Date;
}

export interface Bookmark {
  id: number;
  user_id: number;
  event_id: number;
  created_at: Date;
}

export interface AuthToken {
  id: number;
  email: string;
  token: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

/** Keyword-based tag classification for events */
export function classifyEvent(title: string, description?: string): EventTag[] {
  const text = `${title} ${description || ""}`.toLowerCase();
  const tagKeywords: Record<EventTag, string[]> = {
    // Event format
    "co-working": ["coworking", "co-working", "work session", "hack session", "build session"],
    "discussion": ["discussion", "roundtable", "q&a", "ama", "debate", "town hall"],
    "hangout": ["happy hour", "mixer", "hangout", "social", "party", "brunch", "gathering", "meetup"],
    "networking": ["networking", "professional", "career", "conference", "summit", "connect"],
    "pitching-demo": ["pitch night", "demo day", "pitch competition", "showcase", "demo night"],
    "speaker-panel": ["panel", "fireside", "keynote", "speaker", "talk", "lecture", "seminar"],
    // Topics
    "branding": ["branding", "brand strategy", "brand identity", "brand building"],
    "business-strategy": ["business strategy", "strategy session", "business model", "competitive"],
    "capital-deployment": ["capital deployment", "investment strategy", "portfolio", "asset allocation"],
    "code-engineering": ["programming", "coding", "hackathon", "software", "developer", "engineering", "api", "web3", "blockchain", "ai", "machine learning", "data", "tech"],
    "finance": ["finance", "fintech", "accounting", "financial", "revenue", "profit"],
    "fundraising": ["fundraising", "fundraise", "raise capital", "investor", "venture capital", "vc", "angel"],
    "gtm": ["go to market", "gtm", "launch strategy", "market entry", "distribution"],
    "legal-ip": ["legal", "ip", "intellectual property", "patent", "trademark", "compliance", "regulatory"],
    "marketing": ["marketing", "growth marketing", "content marketing", "seo", "social media", "advertising"],
    "org-management": ["organization", "management", "operations", "leadership", "team building", "culture"],
    "recruiting": ["recruiting", "hiring", "talent", "recruitment", "job fair", "career fair"],
    "product": ["product", "product management", "product design", "roadmap", "user research"],
    "pitching-howto": ["how to pitch", "pitch deck", "pitch workshop", "pitch practice", "storytelling"],
    "policy": ["policy", "regulation", "government", "civic", "public policy", "advocacy"],
    "sales": ["sales", "revenue", "closing", "b2b", "enterprise sales", "sales strategy"],
    "scaling": ["scaling", "scale", "growth stage", "hypergrowth", "expansion"],
    "uiux-cx": ["ux", "ui", "design", "user experience", "customer experience", "cx", "usability"],
    // Business stage
    "concept": ["idea stage", "concept", "ideation", "validation", "pre-launch"],
    "pre-seed": ["pre-seed", "preseed"],
    "seed": ["seed stage", "seed round", "seed funding"],
    "series-a": ["series a", "series-a"],
    "growth": ["growth stage", "series b", "series c", "growth equity"],
    "late-stage": ["late stage", "late-stage", "ipo", "pre-ipo", "public market"],
  };

  const matched: EventTag[] = [];
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.push(tag as EventTag);
    }
  }
  return matched.length > 0 ? matched : ["hangout"];
}
