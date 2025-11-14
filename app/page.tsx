"use client";

import { useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
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

type Stats = {
  fid: string;
  days: number;
  totalCasts: number;
  totalLikes: number;
  totalRecasts: number;
  totalReplies: number;
  engagementScore: number;
  topCast: TopCast | null;
};

// ganti ini dengan FID kamu untuk testing di browser biasa
const DEFAULT_FID = "250425";

export default function Home() {
  const { context, setFrameReady, isFrameReady } = useMiniKit();

  const [fid, setFid] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      <StatsCard stats={stats} />
    </main>
  );
}

function StatsCard({ stats }: { stats: Stats }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Base Week</h1>
          <p className={styles.subtitle}>
            Last {stats.days} days on Farcaster
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <Stat label="Casts" value={stats.totalCasts} />
        <Stat label="Likes received" value={stats.totalLikes} />
        <Stat label="Recasts received" value={stats.totalRecasts} />
        <Stat label="Replies received" value={stats.totalReplies} />
      </div>

      <div className={styles.topCast}>
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
