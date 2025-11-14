import { NextResponse } from "next/server";
import {
  fetchUserCasts,
  NeynarCast,
  NeynarFeedResponse,
} from "@/lib/neynar";

const DAYS = 7;

type TopCast = {
  text: string;
  hash: string;
  timestamp: string;
  likes: number;
  recasts: number;
  replies: number;
  score: number;
} | null;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fid = searchParams.get("fid");

  if (!fid) {
    return NextResponse.json({ error: "missing fid" }, { status: 400 });
  }

  const since = Date.now() - DAYS * 24 * 60 * 60 * 1000;

  let cursor: string | undefined;
  let done = false;

  let totalCasts = 0;
  let totalLikes = 0;
  let totalRecasts = 0;
  let totalReplies = 0;

  let topCast: TopCast = null;
  let topScore = -1;

  while (!done) {
    const data: NeynarFeedResponse = await fetchUserCasts(fid, cursor);
    const casts: NeynarCast[] = data.casts ?? [];

    if (casts.length === 0) break;

    for (const cast of casts) {
      const ts = new Date(cast.timestamp).getTime();
      if (ts < since) {
        done = true;
        break;
      }

      totalCasts++;

      const likes =
        cast.reactions?.likes_count ??
        cast.reactions?.likes ??
        0;

      const recasts =
        cast.reactions?.recasts_count ??
        cast.reactions?.recasts ??
        0;

      const replies = cast.replies?.count ?? 0;

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

  const engagementScore =
    totalLikes + totalRecasts * 3 + totalReplies * 10;

  return NextResponse.json({
    fid,
    days: DAYS,
    totalCasts,
    totalLikes,
    totalRecasts,
    totalReplies,
    engagementScore,
    topCast,
  });
}
