// minikit.config.ts

const ROOT_URL =
  process.env.NEXT_PUBLIC_URL || "https://my-base-week.vercel.app";

export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjI1MDQyNSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDI3MzY4ODllZWQ0RDFiQjE4QjU0NmVmNDgyMzU1ODZEQUJjMDE2M0EifQ",
    payload: "eyJkb21haW4iOiJteS1iYXNlLXdlZWsudmVyY2VsLmFwcCJ9",
    signature:
      "ceF9LD4K61KO0zpfnf78uJw7ya5AZWp9qpRwdjgvukM9gdVxpKhcwukFZdyJZtN0wNGNg+yuXNnzY/CPodm+MBw=",
  },

  miniapp: {
    version: "1",
    name: "My Base Week",
    subtitle: "Your last 7 days on Farcaster",
    description:
      "See your weekly Farcaster stats inside Base App: casts, likes, recasts, replies, and your top cast.",

    // asset masih pakai nama default, nanti bisa kamu ganti kalau sudah siap gambar
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#020617",

    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,

    primaryCategory: "social",
    tags: ["farcaster", "analytics", "base-app", "stats"],

    heroImageUrl: `${ROOT_URL}/blue-hero.png`,

    // sudah < 30 karakter
    tagline: "Your Farcaster week",
    ogTitle: "My Base Week",

    ogDescription:
      "See your last 7 days of Farcaster activity in one simple Base mini app.",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;

export type MiniAppConfig = typeof minikitConfig;
