// app/share/[fid]/page.tsx
import type { Metadata, ResolvingMetadata } from "next";
import { minikitConfig } from "../../../minikit.config";

const APP_URL =
  process.env.NEXT_PUBLIC_SHARE_URL ?? "https://my-base-week-share.vercel.app";

type ShareParams = { fid: string };

export async function generateMetadata(
  { params }: { params: Promise<ShareParams> },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { fid } = await params;

  const ogImageUrl = `${APP_URL}/api/og/${fid}`;
  const title = `Farcaster Weekly Stats – fid ${fid}`;
  const description = `Weekly Farcaster stats for fid ${fid}.`;

  const miniappEmbed = {
    version: minikitConfig.miniapp.version,
    imageUrl: ogImageUrl,
    button: {
      title: "Check Your Weekly Stats",
      action: {
        type: "launch_frame",
        name: "Check Your Weekly Stats",
        url: minikitConfig.miniapp.homeUrl,
        splashImageUrl: minikitConfig.miniapp.splashImageUrl,
        splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
      },
    },
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify(miniappEmbed),
      "fc:frame": JSON.stringify(miniappEmbed),
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<ShareParams>;
}) {
  const { fid } = await params;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 0%, #A78BFA 0, #7C5CFF 40%, #5B21FF 80%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        color: "white",
        fontFamily:
          '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <img
        src={`/api/og/${fid}`}
        alt={`Farcaster Weekly Stats for fid ${fid}`}
        style={{
          maxWidth: "100%",
          height: "auto",
          borderRadius: 24,
          boxShadow: "0 24px 60px rgba(15,23,42,0.75)",
        }}
      />

      <p
        style={{
          marginTop: 24,
          opacity: 0.9,
          fontSize: 14,
          textAlign: "center",
        }}
      >
        Open this link in the Base mini app to see your full interactive week.
      </p>
    </div>
  );
}
