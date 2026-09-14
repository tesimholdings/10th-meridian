import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/legal/", "/remind", "/sign-in"],
        disallow: ["/member/", "/admin/", "/api/", "/onboarding/", "/demo/", "/apply"],
      },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
