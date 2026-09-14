import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { brand } from "@/lib/config/site";
import { env } from "@/lib/env";
import { TimezoneBeacon } from "@/components/access/timezone-beacon";
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

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: `${brand.idea} ${brand.positioning}`,
  robots: { index: true, follow: true },
  openGraph: {
    title: brand.name,
    description: brand.idea,
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-void font-sans text-ivory">
        <TimezoneBeacon />
        {children}
      </body>
    </html>
  );
}
