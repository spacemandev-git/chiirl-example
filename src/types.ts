export const EVENT_TAGS = [
  "tech",
  "startup",
  "social",
  "arts",
  "sports",
  "food",
  "music",
  "networking",
  "education",
  "health",
] as const;

export type EventTag = (typeof EVENT_TAGS)[number];

export interface ChiEvent {
  title: string;
  description: string;
  url: string;
  source: "luma" | "meetup";
  source_id: string;
  start_time: Date;
  end_time?: Date;
  location?: string;
  image_url?: string;
  tags: EventTag[];
}

export interface User {
  id: number;
  phone: string;
  name?: string;
  tags: EventTag[];
  subscribed: boolean;
}

export interface Click {
  id: number;
  user_id: number;
  event_id: number;
  clicked_at: Date;
}
