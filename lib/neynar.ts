// lib/neynar.ts

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY!;

if (!NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY belum diset di .env.local");
}

export async function fetchUserCasts(fid: string, cursor?: string) {
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
    }
  );

  if (!res.ok) {
    throw new Error(`Neynar error: ${res.status}`);
  }

  return res.json(); // any
}
