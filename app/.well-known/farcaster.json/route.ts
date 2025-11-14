// app/.well-known/farcaster.json/route.ts

export async function GET() {
  return Response.json({
    miniapp: {
      version: "1",
      name: "My Base Week",
      subtitle: "Your last 7 days on Farcaster",
      description:
        "See your weekly Farcaster stats inside Base App: casts, likes, recasts, replies, and your top cast.",

      // gambar & aset — sesuaikan kalau kamu ganti nama file / domain
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

      // teks tombol di embed (yang di bawah gambar)
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
