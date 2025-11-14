const ROOT_URL = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

export const minikitConfig = {
  // ini akan diisi nanti di langkah accountAssociation (step 4)
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "My Base Week",
    subtitle: "Your last 7 days on Farcaster",
    description:
      "See your weekly Farcaster stats inside Base App: casts, likes, recasts, replies, and your top cast.",

    // gambar-gambar ini pakai asset dari folder public bawaan template
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#020617",

    // URL utama mini app kamu (sudah kita set di NEXT_PUBLIC_URL)
    homeUrl: ROOT_URL,

    // untuk sekarang boleh dibiarkan seperti ini, nanti bisa dipakai kalau kamu punya webhook
    webhookUrl: `${ROOT_URL}/api/webhook`,

    primaryCategory: "social",
    tags: ["farcaster", "analytics", "base-app", "stats"],

    heroImageUrl: `${ROOT_URL}/blue-hero.png`,
    tagline: "Your Farcaster week at a glance",
    ogTitle: "My Base Week – Farcaster stats mini app",
    ogDescription:
      "See your last 7 days of Farcaster activity in one simple Base mini app.",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;
