export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://moodstoryai.vercel.app/sitemap.xml",
  };
}
