// lib/neynar.ts

// Pakai `as string` supaya TypeScript tahu ini pasti string.
// Kalau env belum di-set, kita lempar error.
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY as string;

if (!NEYNAR_API_KEY) {
  throw new Error("Missing NEYNAR_API_KEY env var");
}

export type NeynarCast = {
  timestamp: string;
  text: string;
  hash: string;
  author?: {
    fid?: number;
    username?: string;
    display_name?: string;
    pfp_url?: string;
    pfp?: { url?: string };
  };
  // bentuk object reactions di Neynar lumayan fleksibel,
  // jadi kita biarkan unknown dan kita parse manual.
  reactions?: unknown;
  replies?: {
    count?: number;
  };
};

export type NeynarFeedResponse = {
  casts?: NeynarCast[];
  next?: { cursor?: string };
};

export type TopCast = {
  text: string;
  hash: string;
  timestamp: string;
  likes: number;
  recasts: number;
  replies: number;
  score: number;
} | null;

export type WeeklyStats = {
  fid: string;
  days: number;
  totalCasts: number;
  totalLikes: number;
  totalRecasts: number;
  totalReplies: number;
  engagementScore: number;
  topCast: TopCast;
  userDisplayName: string | null;
  userName: string | null;
  pfpUrl: string | null;
};

// ---------- helper kecil buat ekstrak like / recast ----------
function getReactionCounts(reactions: unknown): { likes: number; recasts: number } {
  if (!reactions) return { likes: 0, recasts: 0 };

  const r: any = reactions;
  let likes = 0;
  let recasts = 0;

  // beberapa bentuk yang mungkin muncul dari Neynar
  if (typeof r.likes_count === "number") {
    likes = r.likes_count;
  } else if (Array.isArray(r.likes)) {
    likes = r.likes.length;
  } else if (typeof r.likes?.count === "number") {
    likes = r.likes.count;
  }

  if (typeof r.recasts_count === "number") {
    recasts = r.recasts_count;
  } else if (Array.isArray(r.recasts)) {
    recasts = r.recasts.length;
  } else if (typeof r.recasts?.count === "number") {
    recasts = r.recasts.count;
  }

  return { likes, recasts };
}

// ---------- ambil cast user dari Neynar ----------
export async function fetchUserCasts(
  fid: string,
  cursor?: string
): Promise<NeynarFeedResponse> {
  const params = new URLSearchParams({
    fid,
    limit: "50",
  });

  if (cursor) params.set("cursor", cursor);

  const res = await fetch(
    `https://api.neynar.com/v2/farcaster/feed/user/casts?${params.toString()}`,
    {
      headers: {
        "x-api-key": NEYNAR_API_KEY,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Neynar error: ${res.status}`);
  }

  return (await res.json()) as NeynarFeedResponse;
}

// ---------- helper utama dipakai /api/my-base-week ----------
export async function getWeeklyStats(
  fid: string,
  days: number
): Promise<WeeklyStats> {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;

  let cursor: string | undefined;
  let done = false;

  let totalCasts = 0;
  let totalLikes = 0;
  let totalRecasts = 0;
  let totalReplies = 0;

  let topCast: TopCast = null;
  let topScore = -1;

  let userDisplayName: string | null = null;
  let userName: string | null = null;
  let pfpUrl: string | null = null;

  while (!done) {
    const data = await fetchUserCasts(fid, cursor);
    const casts = data.casts ?? [];

    if (casts.length === 0) break;

    // Ambil info profil dari cast pertama (sekali saja)
    if (!userDisplayName && casts[0]?.author) {
      const a = casts[0].author as any;
      userDisplayName = a.display_name ?? null;
      userName = a.username ?? null;
      pfpUrl = a.pfp_url ?? a.pfp?.url ?? null;
    }

    for (const cast of casts) {
      const ts = new Date(cast.timestamp).getTime();
      if (ts < since) {
        done = true;
        break;
      }

      totalCasts++;

      const { likes, recasts } = getReactionCounts(cast.reactions);
      const replies = cast.replies?.count ?? 0;

      // akumulasi total
      totalLikes += likes;
      totalRecasts += recasts;
      totalReplies += replies;

      const score = likes + recasts * 3 + replies * 10;

      if (score > topScore) {
        topScore = score;
        topCast = {
          text: cast.text,
          hash: cast.hash,
          timestamp: cast.timestamp,
          likes,
          recasts,
          replies,
          score,
        };
      }
    }

    if (done) break;
    if (!data.next?.cursor) break;
    cursor = data.next.cursor;
  }

  const engagementScore = totalLikes + totalRecasts * 3 + totalReplies * 10;

  return {
    fid,
    days,
    totalCasts,
    totalLikes,
    totalRecasts,
    totalReplies,
    engagementScore,
    topCast,
    userDisplayName,
    userName,
    pfpUrl,
  };
}
