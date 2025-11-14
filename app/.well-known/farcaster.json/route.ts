// app/.well-known/farcaster.json/route.ts

// kalau env ini = "true", manifest DIMATIKAN (balik 404)
const DISABLE_MANIFEST =
  process.env.NEXT_PUBLIC_DISABLE_MINIAPP_MANIFEST === "true";

export async function GET() {
  // 🔥 dipakai di PROJECT SHARE (my-base-week-share)
  // supaya domain share BUKAN mini app → Warpcast pakai OG image
  if (DISABLE_MANIFEST) {
    return new Response("Not found", { status: 404 });
  }

  // 🔥 dipakai di PROJECT UTAMA (my-base-week)
  // manifest tetap aktif seperti sebelumnya
  return Response.json({
    miniapp: {
      version: "1",
      name: "My Base Week",
      subtitle: "Your last 7 days on Farcaster",
      description:
        "See your weekly Farcaster stats inside Base App: casts, likes, recasts, replies, and your top cast.",

      // gambar & aset
      iconUrl: "https://my-base-week.vercel.app/icon.png",
      splashImageUrl: "https://my-base-week.vercel.app/hero.png",
      splashBackgroundColor: "#020617",
      screenshotUrls: [
        "https://my-base-week.vercel.app/screenshot-portrait.png",
      ],
      heroImageUrl: "https://my-base-week.vercel.app/hero.png",

      // URL mini app
      homeUrl: "https://my-base-week.vercel.app",
      webhookUrl: "https://my-base-week.vercel.app/api/webhook",

      // teks tombol di embed
      buttonTitle: "Check your stats this week",

      // kategori & tag
      primaryCategory: "social",
      tags: ["farcaster", "analytics", "base-app", "stats"],

      // meta untuk preview
      tagline: "Your Farcaster week at a glance",
      ogTitle: "My Base Week",
      ogDescription:
        "See your last 7 days of Farcaster activity in one simple Base mini app.",
      ogImageUrl: "https://my-base-week.vercel.app/hero.png",
    },
  });
}
