import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: env.siteUrl, lastModified: new Date() },
    { url: `${env.siteUrl}/legal/privacy`, lastModified: new Date() },
    { url: `${env.siteUrl}/legal/terms`, lastModified: new Date() },
    { url: `${env.siteUrl}/legal/community`, lastModified: new Date() },
    { url: `${env.siteUrl}/legal/refund`, lastModified: new Date() },
  ];
}
