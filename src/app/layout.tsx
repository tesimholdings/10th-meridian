import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { brand } from "@/lib/config/site";
import { env } from "@/lib/env";
import { TimezoneSync } from "@/components/access/timezone-sync";
import { CursorAura } from "@/components/atmosphere/cursor-aura";
import { PostHogInit } from "@/lib/posthog/provider";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070809",
};

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: `${brand.idea} ${brand.positioning}`,
  robots: { index: true, follow: true },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: brand.name,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: brand.name,
    description: brand.idea,
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-void font-sans text-ivory">
        <TimezoneSync />
        <CursorAura />
        <PostHogInit />
        {children}
      </body>
    </html>
  );
}
