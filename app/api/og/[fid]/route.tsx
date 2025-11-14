// app/api/og/[fid]/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type StatsUser = {
  fid: string;
  username: string;
  displayName: string;
  pfpUrl: string | null;
};

type Stats = {
  fid: string;
  days: number;
  totalCasts: number;
  totalLikes: number;
  totalRecasts: number;
  totalReplies: number;
  engagementScore: number;
  userDisplayName?: string | null;
  userName?: string | null;
  pfpUrl?: string | null;
  user?: StatsUser | null;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fid: string }> }
) {
  const { fid } = await params;

  let stats: Stats | null = null;

  try {
    const host = req.headers.get("host") ?? "";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;

    const res = await fetch(
      `${origin}/api/my-base-week?fid=${encodeURIComponent(fid)}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      stats = (await res.json()) as Stats;
    }
  } catch (err) {
    console.error("Failed to fetch stats for OG image:", err);
  }

  const days = stats?.days ?? 7;
  const totalCasts = stats?.totalCasts ?? 0;
  const totalLikes = stats?.totalLikes ?? 0;
  const totalRecasts = stats?.totalRecasts ?? 0;
  const totalReplies = stats?.totalReplies ?? 0;
  const engagement = stats?.engagementScore ?? 0;

  const displayName =
    stats?.user?.displayName ??
    stats?.userDisplayName ??
    "Farcaster user";

  const usernameRaw =
    stats?.user?.username ??
    stats?.userName ??
    "";

  const username = usernameRaw ? `@${usernameRaw}` : `fid ${fid}`;

  const pfpUrl =
    stats?.user?.pfpUrl ??
    stats?.pfpUrl ??
    null;

  const initial =
    (displayName || usernameRaw || "F").charAt(0).toUpperCase() || "F";

  const statItems = [
    { label: "Casts", value: totalCasts },
    { label: "Likes", value: totalLikes },
    { label: "Recasts", value: totalRecasts },
    { label: "Replies", value: totalReplies },
  ];

  const avatarSize = 120;
  const fcPurple = "#7C5CFF";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background:
            "radial-gradient(circle at 50% 0%, #A78BFA 0, #7C5CFF 40%, #5B21FF 80%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          // base font: modern sans (mirip Canva)
          fontFamily:
            '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          color: "white",
        }}
      >
        {/* kontainer utama */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            width: 960,
          }}
        >
          {/* avatar + identitas */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: 4,
                borderRadius: 9999,
                background: `radial-gradient(circle at 30% 0%, ${fcPurple}, #4C1D95)`,
                boxShadow: `0 0 32px rgba(124,92,255,0.9)`,
              }}
            >
              {pfpUrl ? (
                <img
                  src={pfpUrl}
                  width={avatarSize}
                  height={avatarSize}
                  style={{
                    borderRadius: 9999,
                    objectFit: "cover",
                    border: "3px solid rgba(76,29,149,0.9)",
                    backgroundColor: "#4C1D95",
                  }}
                  alt="pfp"
                />
              ) : (
                <div
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: 9999,
                    background:
                      "linear-gradient(145deg, #4C1D95, #7C5CFF)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                    fontWeight: 700,
                    border: `3px solid ${fcPurple}`,
                  }}
                >
                  <span>{initial}</span>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  fontWeight: 650,
                  textShadow: "0 1px 3px rgba(15,23,42,0.8)",
                }}
              >
                <span>{displayName}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 17,
                  opacity: 0.95,
                }}
              >
                <span>{username}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 13,
                  opacity: 0.82,
                }}
              >
                <span>fid {fid}</span>
              </div>
            </div>
          </div>

          {/* title – modern, bold, sedikit letter spacing */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              marginTop: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontWeight: 750,
                letterSpacing: 0.8,
                textShadow: "0 2px 6px rgba(15,23,42,0.7)",
              }}
            >
              <span>Farcaster Weekly Stats</span>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                opacity: 0.96,
              }}
            >
              <span>Last {days} days on Farcaster</span>
            </div>
          </div>

          {/* grid 4 stats */}
          <div
            style={{
              display: "flex",
              gap: 20,
              width: "100%",
              marginTop: 10,
            }}
          >
            {statItems.map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flex: 1,
                  padding: "20px 22px",
                  borderRadius: 26,
                  background:
                    "linear-gradient(145deg, rgba(76,29,149,0.95), rgba(55,20,130,0.85))",
                  border: "1px solid rgba(221,214,254,0.9)",
                  boxShadow: "0 18px 45px rgba(55,20,130,0.9)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 15,
                    fontWeight: 500,
                    letterSpacing: 0.4,
                    opacity: 0.94,
                    marginBottom: 6,
                  }}
                >
                  <span>{item.label}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 36,
                    fontWeight: 730,
                    lineHeight: 1.1,
                    textShadow: "0 1px 4px rgba(15,23,42,0.7)",
                  }}
                >
                  <span>{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* engagement + footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 18,
              fontSize: 16.5,
              opacity: 0.97,
            }}
          >
            <div
              style={{
                display: "flex",
                fontWeight: 500,
              }}
            >
              <span>Engagement score&nbsp;</span>
              <span style={{ fontWeight: 730 }}>{engagement}</span>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 15,
                opacity: 0.9,
              }}
            >
              <span>my-base-week · base mini app</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 14,
              opacity: 0.85,
              marginTop: 4,
            }}
          >
            <span>Open the mini app to see full details</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
