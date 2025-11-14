// app/api/my-base-week/route.ts
import { NextResponse } from "next/server";
import { getWeeklyStats, WeeklyStats } from "@/lib/neynar";

const DAYS = 7;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fid = searchParams.get("fid");

  if (!fid) {
    return NextResponse.json({ error: "missing fid" }, { status: 400 });
  }

  try {
    // ambil stats + info user dari helper di lib/neynar.ts
    const stats: WeeklyStats = await getWeeklyStats(fid, DAYS);

    // Transform ke struktur yang diharapkan frontend
    return NextResponse.json({
      fid: stats.fid,
      days: stats.days,
      totalCasts: stats.totalCasts,
      totalLikes: stats.totalLikes,
      totalRecasts: stats.totalRecasts,
      totalReplies: stats.totalReplies,
      engagementScore: stats.engagementScore,
      topCast: stats.topCast,
      user: stats.userName ? {
        fid: stats.fid,
        username: stats.userName,
        displayName: stats.userDisplayName || stats.userName,
        pfpUrl: stats.pfpUrl,
      } : null,
    });
  } catch (err) {
    console.error("getWeeklyStats error", err);
    return NextResponse.json(
      {
        error: "failed to fetch stats",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}