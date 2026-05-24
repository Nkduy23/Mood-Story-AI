import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const domain = "https://moodstoryai.vercel.app/";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "MoodStory — Tạo story aesthetic trong vài giây",
    description: "Tải ảnh lên, chọn mood, nhận ngay một story đẹp lung linh. Tạo video AI cho Instagram, TikTok & Facebook — miễn phí, không cần đăng ký.",
    metadataBase: new URL(domain),
    keywords: ["story creator", "AI video", "aesthetic story", "reels maker", "TikTok story", "tạo story đẹp", "video AI"],
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
    openGraph: {
      title: "MoodStory — Tạo story aesthetic trong vài giây",
      description: "Tải ảnh lên, chọn mood, nhận ngay story đẹp. AI-powered cho Instagram, TikTok & Facebook.",
      url: `${domain}/`,
      siteName: "MoodStory",
      locale: "vi_VN",
      type: "website",
      images: [
        {
          url: `${domain}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "MoodStory — Tạo story aesthetic trong vài giây",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "MoodStory — Tạo story aesthetic trong vài giây",
      description: "Tải ảnh lên, chọn mood, nhận ngay story đẹp. AI-powered cho Instagram, TikTok & Facebook.",
      images: [`${domain}/og-image.jpg`],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "MoodStory",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#08080f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <I18nProvider>{children}</I18nProvider>
        <div id="toast-container" aria-live="polite" aria-atomic="false" />
        <Analytics />
      </body>
    </html>
  );
}
