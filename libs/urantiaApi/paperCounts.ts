/**
 * Fetches and caches paper paragraph counts from api.urantia.dev.
 * Used for local progress calculation.
 */

import { getRedisClient } from "@/libs/redis";
import { resolveApiHost } from "./client";
const CACHE_KEY = "paper-paragraph-counts";
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 1 week

type ApiPaperDetail = {
  data: {
    paper: { id: string };
    paragraphs: Array<{ id: string }>;
  };
};

/**
 * Get paragraph counts for all 197 papers.
 * Fetches from the API and caches in Redis for 1 week.
 * Returns a Map<paperId, paragraphCount>.
 */
export async function getPaperParagraphCounts(): Promise<Map<string, number>> {
  const redis = getRedisClient();

  // Try cache first
  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        const parsed: Record<string, number> = JSON.parse(cached);
        return new Map(Object.entries(parsed));
      }
    } catch {
      // Cache miss or error, proceed to fetch
    }
  }

  // Fetch all papers to get paragraph counts
  const counts = new Map<string, number>();
  const paperIds = Array.from({ length: 197 }, (_, i) => String(i));

  // Fetch in batches of 20 to avoid overwhelming the API
  const BATCH_SIZE = 20;
  for (let i = 0; i < paperIds.length; i += BATCH_SIZE) {
    const batch = paperIds.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (id) => {
        try {
          const res = await fetch(`${resolveApiHost()}/papers/${id}`);
          if (!res.ok) return { id, count: 0 };
          const json: ApiPaperDetail = await res.json();
          return { id, count: json.data.paragraphs.length };
        } catch {
          return { id, count: 0 };
        }
      })
    );
    for (const { id, count } of results) {
      counts.set(id, count);
    }
  }

  // Cache the result
  if (redis) {
    try {
      const serialized = JSON.stringify(Object.fromEntries(counts));
      await redis.set(CACHE_KEY, serialized, "EX", CACHE_TTL_SECONDS);
    } catch {
      // Cache write failure is non-critical
    }
  }

  return counts;
}
