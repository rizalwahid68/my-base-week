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
    stats?.user?.displayName ?? stats?.userDisplayName ?? "Farcaster user";

  const usernameRaw = stats?.user?.username ?? stats?.userName ?? "";
  const username = usernameRaw ? `@${usernameRaw}` : `fid ${fid}`;

  const pfpUrl = stats?.user?.pfpUrl ?? stats?.pfpUrl ?? null;

  const initial =
    (displayName || usernameRaw || "F").charAt(0).toUpperCase() || "F";

  const statItems = [
    { label: "Casts", value: totalCasts },
    { label: "Likes", value: totalLikes },
    { label: "Recasts", value: totalRecasts },
    { label: "Replies", value: totalReplies },
  ];

  const avatarSize = 112;
  const fcPurple = "#7C5CFF";

  const CARD_WIDTH = 1040;
  const CARD_HEIGHT = 540;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 0%, #1D1040 0, #020617 45%, #020617 100%)",
          fontFamily:
            '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          color: "white",
        }}
      >
        {/* CARD di tengah, ukuran sedikit lebih kecil supaya tidak kepotong */}
        <div
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            borderRadius: 40,
            padding: "40px 44px 32px 44px",
            background:
              "radial-gradient(circle at 50% 0%, #A78BFA 0, #7C5CFF 38%, #5B21FF 80%)",
            boxShadow: "0 24px 60px rgba(15,23,42,0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* SECTION: Avatar + identitas */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: 4,
                borderRadius: 9999,
                background: `radial-gradient(circle at 30% 0%, ${fcPurple}, #4C1D95)`,
                boxShadow: `0 0 28px rgba(124,92,255,0.9)`,
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
                  fontSize: 24,
                  fontWeight: 650,
                  textShadow: "0 1px 3px rgba(15,23,42,0.8)",
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: 16,
                  opacity: 0.95,
                }}
              >
                {username}
              </div>
              <div
                style={{
                  fontSize: 13,
                  opacity: 0.8,
                }}
              >
                fid {fid}
              </div>
            </div>
          </div>

          {/* SECTION: Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              marginTop: 4,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 750,
                letterSpacing: 0.7,
                textShadow: "0 2px 6px rgba(15,23,42,0.7)",
              }}
            >
              Farcaster Weekly Stats
            </div>
            <div
              style={{
                fontSize: 18,
                opacity: 0.96,
              }}
            >
              Last {days} days on Farcaster
            </div>
          </div>

          {/* SECTION: 4 stats */}
          <div
            style={{
              display: "flex",
              gap: 18,
              width: "100%",
              marginTop: 10,
            }}
          >
            {statItems.map((item) => (
              <div
                key={item.label}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "18px 20px",
                  borderRadius: 24,
                  background:
                    "linear-gradient(145deg, rgba(76,29,149,0.96), rgba(55,20,130,0.9))",
                  border: "1px solid rgba(221,214,254,0.9)",
                  boxShadow: "0 14px 35px rgba(55,20,130,0.9)",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: 0.4,
                    opacity: 0.94,
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 730,
                    lineHeight: 1.1,
                    textShadow: "0 1px 4px rgba(15,23,42,0.7)",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* SECTION: Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginTop: 18,
              fontSize: 16,
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
                fontSize: 15,
                opacity: 0.9,
              }}
            >
              my-base-week · base mini app
            </div>
          </div>

          <div
            style={{
              fontSize: 13,
              opacity: 0.84,
              marginTop: 2,
              textAlign: "center",
            }}
          >
            Open the mini app to see full details
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
