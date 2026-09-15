/**
 * Server-safe environment access.
 * Client code must only read NEXT_PUBLIC_* values.
 */

import { resolvePublicOrigin } from "@/lib/config/public-origin";

export type RuntimeMode = "preview" | "live";
export type OpenHouseForce = "auto" | "open" | "closed";

function read(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

function readBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  return raw === "true" || raw === "1" || raw === "yes";
}

export const env = {
  get isProduction(): boolean {
    return process.env.VERCEL_ENV === "production";
  },
  get runtimeMode(): RuntimeMode {
    return read("NEXT_PUBLIC_RUNTIME_MODE", "preview") === "live"
      ? "live"
      : "preview";
  },
  get previewTools(): boolean {
    if (process.env.VERCEL_ENV === "production") return false;
    return readBool("NEXT_PUBLIC_PREVIEW_TOOLS", true);
  },
  get previewDemoAuth(): boolean {
    if (process.env.VERCEL_ENV === "production") return false;
    return readBool("PREVIEW_DEMO_AUTH", true);
  },
  get siteUrl(): string {
    return resolvePublicOrigin({
      appUrl: read("NEXT_PUBLIC_APP_URL"),
      siteUrl: read("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
      vercelUrl: read("VERCEL_URL"),
    });
  },
  get siteName(): string {
    return read("NEXT_PUBLIC_SITE_NAME", "10th Meridian");
  },
  get openHouseTimezone(): string {
    return read("OPEN_HOUSE_TIMEZONE", "America/Chicago");
  },
  get openHouseDay(): number {
    const n = Number(read("OPEN_HOUSE_DAY", "10"));
    return Number.isFinite(n) ? n : 10;
  },
  get openHouseReferralHour(): number {
    const n = Number(read("OPEN_HOUSE_REFERRAL_HOUR", "9"));
    return Number.isFinite(n) ? n : 9;
  },
  get openHouseGeneralHour(): number {
    const n = Number(read("OPEN_HOUSE_GENERAL_HOUR", "10"));
    return Number.isFinite(n) ? n : 10;
  },
  get openHouseCloseHour(): number {
    const n = Number(read("OPEN_HOUSE_CLOSE_HOUR", "22"));
    return Number.isFinite(n) ? n : 22;
  },
  get openHouseForce(): OpenHouseForce {
    const raw = read("OPEN_HOUSE_FORCE", "auto");
    if (raw === "open" || raw === "closed") return raw;
    return "auto";
  },
  get admissionsCap(): number {
    const n = Number(read("ADMISSIONS_MONTHLY_CAP", "10"));
    return Number.isFinite(n) && n > 0 ? n : 10;
  },
  get supabaseUrl(): string {
    return read("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey(): string {
    return read("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get supabaseServiceRoleKey(): string {
    return read("SUPABASE_SERVICE_ROLE_KEY");
  },
  get stripeSecretKey(): string {
    return read("STRIPE_SECRET_KEY");
  },
  get stripeWebhookSecret(): string {
    return read("STRIPE_WEBHOOK_SECRET");
  },
  get stripeFoundingPriceId(): string {
    return read("STRIPE_FOUNDING_PRICE_ID");
  },
  get stripeStandardPriceId(): string {
    return read("STRIPE_STANDARD_PRICE_ID");
  },
  get stripeLifetimePriceId(): string {
    // Prefer STRIPE_PRICE_ID (lifetime $10,000). Keep STRIPE_LIFETIME_PRICE_ID as alias.
    return read("STRIPE_PRICE_ID") || read("STRIPE_LIFETIME_PRICE_ID");
  },
  get lifetimePriceLabel(): string {
    return read("NEXT_PUBLIC_LIFETIME_PRICE_LABEL", "$10,000");
  },
  get foundingPriceLabel(): string {
    return read(
      "NEXT_PUBLIC_FOUNDING_PRICE_LABEL",
      "[INSERT APPROVED FOUNDING PRICE]",
    );
  },
  get standardPriceLabel(): string {
    return read(
      "NEXT_PUBLIC_STANDARD_PRICE_LABEL",
      "[INSERT APPROVED STANDARD PRICE]",
    );
  },
  get streamApiKey(): string {
    return read("NEXT_PUBLIC_STREAM_API_KEY");
  },
  get streamApiSecret(): string {
    return read("STREAM_API_SECRET");
  },
  get resendApiKey(): string {
    return read("RESEND_API_KEY");
  },
  get resendFromEmail(): string {
    return formatFromAddress(
      read("EMAIL_FROM") || read("RESEND_FROM_EMAIL") || "team@tenmeridian.com",
    );
  },
  get embeddingProvider(): "stub" | "openai" {
    return read("EMBEDDING_PROVIDER", "stub") === "openai" ? "openai" : "stub";
  },
  get openaiApiKey(): string {
    return read("OPENAI_API_KEY");
  },
  get embeddingModel(): string {
    return read("EMBEDDING_MODEL", "text-embedding-3-small");
  },
  get sessionSecret(): string {
    return read("SESSION_SECRET", "preview-only-not-for-production");
  },
  get adminNotificationEmail(): string {
    return read("ADMIN_NOTIFICATION_EMAIL");
  },
  get rateLimitWindowMs(): number {
    return Number(read("RATE_LIMIT_WINDOW_MS", "60000")) || 60_000;
  },
  get rateLimitReferral(): number {
    return Number(read("RATE_LIMIT_MAX_REFERRAL_CHECKS", "8")) || 8;
  },
  get rateLimitReminders(): number {
    return Number(read("RATE_LIMIT_MAX_REMINDERS", "5")) || 5;
  },
  get rateLimitApplications(): number {
    return Number(read("RATE_LIMIT_MAX_APPLICATIONS", "4")) || 4;
  },
  get posthogKey(): string {
    return read("NEXT_PUBLIC_POSTHOG_KEY");
  },
  get posthogHost(): string {
    return read("NEXT_PUBLIC_POSTHOG_HOST", "https://us.i.posthog.com");
  },
  get sentryDsn(): string {
    return read("SENTRY_DSN") || read("NEXT_PUBLIC_SENTRY_DSN");
  },
};

export function hasSupabase(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasStripe(): boolean {
  return Boolean(env.stripeSecretKey);
}

export function hasStream(): boolean {
  return Boolean(env.streamApiKey && env.streamApiSecret);
}

export function hasResend(): boolean {
  return Boolean(env.resendApiKey);
}

export function hasPosthog(): boolean {
  return Boolean(env.posthogKey);
}

export function hasSentryDsn(): boolean {
  return Boolean(env.sentryDsn);
}

export function hasStripePrice(): boolean {
  return Boolean(env.stripeLifetimePriceId);
}

export function canChargeLifetime(): boolean {
  return hasStripe() && hasStripePrice();
}

export function formatFromAddress(raw: string): string {
  const value = raw.trim();
  if (!value) return "10th Meridian <team@tenmeridian.com>";
  if (value.includes("<")) return value;
  return `10th Meridian <${value}>`;
}

export function integrationStatus() {
  return {
    mode: env.runtimeMode,
    supabase: hasSupabase(),
    stripe: hasStripe(),
    stripePrice: hasStripePrice(),
    canCharge: canChargeLifetime(),
    stream: hasStream(),
    resend: hasResend(),
    posthog: hasPosthog(),
    sentry: hasSentryDsn(),
    embeddings: env.embeddingProvider,
  };
}
