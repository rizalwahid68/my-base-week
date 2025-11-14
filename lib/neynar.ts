const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY!;

if (!NEYNAR_API_KEY) {
  throw new Error("Missing NEYNAR_API_KEY env var");
}

export type NeynarCast = {
  timestamp: string;
  text: string;
  hash: string;
  reactions?: {
    likes_count?: number;
    likes?: number;
    recasts_count?: number;
    recasts?: number;
  };
  replies?: {
    count?: number;
  };
};

export type NeynarFeedResponse = {
  casts?: NeynarCast[];
  next?: {
    cursor?: string;
  };
};

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

  const json = (await res.json()) as NeynarFeedResponse;
  return json;
}
