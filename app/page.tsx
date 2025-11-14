"use client";

import { useEffect, useState } from "react";
import { useMiniKit, useOpenUrl } from "@coinbase/onchainkit/minikit";
import styles from "./page.module.css";


type TopCast = {
  text: string;
  hash: string;
  timestamp: string;
  likes: number;
  recasts: number;
  replies: number;
  score: number;
};

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
  topCast: TopCast | null;
  user?: StatsUser | null;
};

// FID default buat testing di browser biasa
const DEFAULT_FID = "250425";

// URL publik mini app kamu (domain di Vercel)
const APP_URL = "https://my-base-week.vercel.app";

export default function Home() {
  const { context, setFrameReady, isFrameReady } = useMiniKit();
  const openUrl = useOpenUrl();

  const [fid, setFid] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  // beri tahu MiniKit kalau frame siap saat dibuka sebagai mini app
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  // tentukan FID yang dipakai: context user (kalau ada) atau DEFAULT_FID
  useEffect(() => {
    const rawContextFid = context?.user?.fid;

    const contextFid =
      typeof rawContextFid === "number" || typeof rawContextFid === "string"
        ? String(rawContextFid)
        : null;

    const fidToUse = contextFid ?? DEFAULT_FID;
    setFid(fidToUse);
  }, [context]);

  // fetch stats setiap kali FID berubah
  useEffect(() => {
    if (!fid) return;

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/my-base-week?fid=${encodeURIComponent(fid)}`
        );

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const json = (await res.json()) as Stats;

        if (!cancelled) {
          setStats(json);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Unknown error";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fid]);

  // handler untuk tombol "Share week"
  const handleShareClick = async () => {
    if (!stats) return;

    setIsSharing(true);

    try {
      const text = buildShareText(stats);

      // URL share spesifik per FID
      const shareUrl = `${APP_URL}/share/${stats.fid}`;
      
      const params = new URLSearchParams();
      // teks + link (kalau embed gagal, link tetap ada di cast)
      params.set("text", `${text}\n\n${shareUrl}`);
      
      // embed URL share agar Warpcast/Base pakai OG image kita
      params.append("embeds[]", shareUrl);
      
      const composerUrl = `https://warpcast.com/~/compose?${params.toString()}`;

      // ✅ gunakan hook MiniKit untuk buka URL di Base App
      if (openUrl) {
        openUrl(composerUrl);
      }
      // fallback di browser biasa
      else if (typeof window !== "undefined") {
        window.open(composerUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Failed to open share composer", err);
    } finally {
      setIsSharing(false);
    }
  };

  if (!fid) {
    return (
      <main className={styles.container}>
        <div className={styles.message}>Initializing…</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.message}>Loading your week…</div>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className={styles.container}>
        <div className={styles.errorBox}>
          <p className={styles.errorTitle}>Something went wrong</p>
          <p className={styles.errorText}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <StatsCard
        stats={stats}
        onShare={handleShareClick}
        isSharing={isSharing}
      />
    </main>
  );
}

function StatsCard({
  stats,
  onShare,
  isSharing,
}: {
  stats: Stats;
  onShare: () => void;
  isSharing: boolean;
}) {
  const user = stats.user ?? undefined;

  const initial =
    user?.displayName?.[0] ??
    user?.username?.[0]?.toUpperCase() ??
    "F";

  // ✅ Handler untuk buka cast di Warpcast
  const handleTopCastClick = () => {
    if (!stats.topCast?.hash) return;

    const castUrl = `https://warpcast.com/~/conversations/${stats.topCast.hash}`;

    // Buka di tab baru (browser fallback)
    if (typeof window !== "undefined") {
      window.open(castUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Base Week</h1>
          <p className={styles.subtitle}>
            Last {stats.days} days on Farcaster
          </p>
        </div>

        {user && (
          <div className={styles.headerRight}>
            <div className={styles.avatarWrapper}>
              {user.pfpUrl ? (
                <img
                  src={user.pfpUrl}
                  alt={user.username || "User avatar"}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarFallback}>{initial}</div>
              )}

            </div>
            <div className={styles.userText}>
              <span className={styles.userName}>{user.displayName}</span>
              <span className={styles.userHandle}>@{user.username}</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.statsGrid}>
        <Stat label="Casts" value={stats.totalCasts} />
        <Stat label="Likes received" value={stats.totalLikes} />
        <Stat label="Recasts received" value={stats.totalRecasts} />
        <Stat label="Replies received" value={stats.totalReplies} />
      </div>

      <div
        className={styles.topCast}
        onClick={handleTopCastClick}
        style={{ cursor: stats.topCast ? "pointer" : "default" }}
      >
        <p className={styles.topCastLabel}>Top cast of the week</p>
        {stats.topCast ? (
          <>
            <p className={styles.topCastText}>{stats.topCast.text}</p>
            <div className={styles.topCastMeta}>
              <span className={styles.metaItem}>
                <span className={styles.emoji}>❤️</span>{" "}
                {stats.topCast.likes}
              </span>
              <span className={styles.metaItem}>
                <span className={styles.emoji}>🔁</span>{" "}
                {stats.topCast.recasts}
              </span>
              <span className={styles.metaItem}>
                <span className={styles.emoji}>💬</span>{" "}
                {stats.topCast.replies}
              </span>
            </div>
          </>
        ) : (
          <p className={styles.topCastEmpty}>
            No casts in the last {stats.days} days.
          </p>
        )}
      </div>

      {/* Row untuk tombol share */}
      <div className={styles.shareRow}>
        <button
          className={styles.shareButton}
          onClick={onShare}
          disabled={isSharing}
        >
          {isSharing ? "Opening composer…" : "Share"}
        </button>
        <p className={styles.shareHint}>
          Makes a cast with your stats and a mini app link.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statBox}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
  );
}

function buildShareText(stats: Stats): string {
  return [
    "my base week on farcaster 📊",
    `${stats.totalCasts} casts · ${stats.totalLikes} likes · ${stats.totalRecasts} recasts · ${stats.totalReplies} replies`,
    "check your own stats with this mini app 👇",
  ].join("\n");
}
