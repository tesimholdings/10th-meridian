/** Social connect catalog. DEMO unless both OAuth env vars exist. */

export const SOCIAL_PROVIDERS = [
  "linkedin",
  "instagram",
  "facebook",
  "x",
  "website",
  "whatsapp",
  "telegram",
  "youtube",
] as const;

export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

export type SocialConnectMode = "demo" | "oauth";

export interface SocialConnection {
  provider: SocialProvider;
  handle?: string;
  url?: string;
  connected: boolean;
  mode: SocialConnectMode;
  connectedAt?: string;
}

export interface SocialProviderMeta {
  id: SocialProvider;
  label: string;
  required: boolean;
  /** Shown as the input placeholder. */
  placeholder: string;
  /** Helper under the field. */
  helper: string;
  example: string;
  supportsOAuth: boolean;
  inputKind: "handle" | "url" | "phone";
}

export const SOCIAL_CATALOG: SocialProviderMeta[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    required: true,
    placeholder: "linkedin.com/in/yourname",
    helper: "Public profile URL or /in/ handle — e.g. linkedin.com/in/yourname.",
    example: "linkedin.com/in/yourname",
    supportsOAuth: true,
    inputKind: "url",
  },
  {
    id: "instagram",
    label: "Instagram",
    required: true,
    placeholder: "@yourname",
    helper: "A public handle is enough — e.g. @yourname.",
    example: "@yourname",
    supportsOAuth: true,
    inputKind: "handle",
  },
  {
    id: "facebook",
    label: "Facebook",
    required: true,
    placeholder: "facebook.com/yourname",
    helper: "Page or profile URL — e.g. facebook.com/yourname.",
    example: "facebook.com/yourname",
    supportsOAuth: true,
    inputKind: "url",
  },
  {
    id: "x",
    label: "X",
    required: true,
    placeholder: "@yourname",
    helper: "Your public @ — e.g. @yourname.",
    example: "@yourname",
    supportsOAuth: true,
    inputKind: "handle",
  },
  {
    id: "website",
    label: "Website",
    required: false,
    placeholder: "yourstudio.com",
    helper: "Optional. A studio or house site — e.g. yourstudio.com.",
    example: "yourstudio.com",
    supportsOAuth: false,
    inputKind: "url",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    required: false,
    placeholder: "+1 512 555 0148",
    helper: "Optional. International number — e.g. +1 512 555 0148.",
    example: "+1 512 555 0148",
    supportsOAuth: false,
    inputKind: "phone",
  },
  {
    id: "telegram",
    label: "Telegram",
    required: false,
    placeholder: "@yourname",
    helper: "Optional. Public username — e.g. @yourname.",
    example: "@yourname",
    supportsOAuth: false,
    inputKind: "handle",
  },
  {
    id: "youtube",
    label: "YouTube",
    required: false,
    placeholder: "youtube.com/@yourname",
    helper: "Optional. Channel URL or @ — e.g. youtube.com/@yourname.",
    example: "youtube.com/@yourname",
    supportsOAuth: false,
    inputKind: "url",
  },
];

export const PRIMARY_SOCIALS = SOCIAL_CATALOG.filter((row) => row.required);
export const OPTIONAL_SOCIALS = SOCIAL_CATALOG.filter((row) => !row.required);

export function isSocialProvider(value: string): value is SocialProvider {
  return (SOCIAL_PROVIDERS as readonly string[]).includes(value);
}

export function socialMeta(provider: SocialProvider): SocialProviderMeta {
  return SOCIAL_CATALOG.find((row) => row.id === provider)!;
}

const HANDLE_RE = /^@?[a-zA-Z0-9._]{2,40}$/;
const PHONE_RE = /^\+?[0-9 ()-]{8,22}$/;

function asUrl(value: string, fallbackHost?: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (fallbackHost && !trimmed.includes(".")) return `https://${fallbackHost}/${trimmed.replace(/^@/, "")}`;
  return `https://${trimmed.replace(/^\/\//, "")}`;
}

export function normalizeSocialInput(
  provider: SocialProvider,
  raw: string,
): { ok: true; handle?: string; url?: string } | { ok: false; message: string } {
  const value = raw.trim();
  if (!value) return { ok: false, message: "Add a handle or URL to connect." };
  const meta = socialMeta(provider);

  if (meta.inputKind === "phone") {
    if (!PHONE_RE.test(value)) {
      return { ok: false, message: "Use an international number, e.g. +1 512 555 0148." };
    }
    const digits = value.replace(/[^\d+]/g, "");
    return { ok: true, handle: digits, url: `https://wa.me/${digits.replace(/^\+/, "")}` };
  }

  if (provider === "linkedin") {
    const url = asUrl(value.includes("linkedin.") ? value : `linkedin.com/in/${value.replace(/^@/, "")}`);
    if (!/linkedin\.com\/in\//i.test(url)) {
      return { ok: false, message: "Use a public LinkedIn URL, e.g. linkedin.com/in/yourname." };
    }
    return { ok: true, handle: value.replace(/^https?:\/\//i, ""), url };
  }

  if (provider === "facebook") {
    const url = asUrl(value.includes("facebook.") || value.includes("fb.com") ? value : `facebook.com/${value.replace(/^@/, "")}`);
    return { ok: true, handle: value.replace(/^https?:\/\//i, ""), url };
  }

  if (provider === "website") {
    const url = asUrl(value);
    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes(".")) {
        return { ok: false, message: "Use a site like yourstudio.com." };
      }
    } catch {
      return { ok: false, message: "Use a site like yourstudio.com." };
    }
    return { ok: true, url };
  }

  if (provider === "youtube") {
    const url = asUrl(
      value.includes("youtube.") || value.includes("youtu.be")
        ? value
        : `youtube.com/@${value.replace(/^@/, "")}`,
    );
    return { ok: true, handle: value.replace(/^https?:\/\//i, ""), url };
  }

  if (provider === "instagram" || provider === "x" || provider === "telegram") {
    const handle = value.startsWith("@") ? value : `@${value.replace(/^https?:\/\/(www\.)?(instagram\.com|x\.com|twitter\.com|t\.me)\//i, "").replace(/\/$/, "")}`;
    const bare = handle.replace(/^@/, "");
    if (!HANDLE_RE.test(handle)) {
      return { ok: false, message: `Use a public handle, e.g. ${meta.example}.` };
    }
    const host =
      provider === "instagram" ? "instagram.com" : provider === "telegram" ? "t.me" : "x.com";
    return { ok: true, handle, url: `https://${host}/${bare}` };
  }

  return { ok: true, handle: value, url: asUrl(value) };
}

export function connectionFromLegacy(input: {
  website?: string;
  linkedin?: string;
}): SocialConnection[] {
  const rows: SocialConnection[] = [];
  if (input.linkedin?.trim()) {
    const parsed = normalizeSocialInput("linkedin", input.linkedin);
    if (parsed.ok) {
      rows.push({
        provider: "linkedin",
        handle: parsed.handle,
        url: parsed.url ?? input.linkedin,
        connected: true,
        mode: "demo",
      });
    }
  }
  if (input.website?.trim()) {
    const parsed = normalizeSocialInput("website", input.website);
    if (parsed.ok) {
      rows.push({
        provider: "website",
        url: parsed.url ?? input.website,
        connected: true,
        mode: "demo",
      });
    }
  }
  return rows;
}

export function upsertSocial(
  existing: SocialConnection[] | undefined,
  next: SocialConnection,
): SocialConnection[] {
  const list = [...(existing ?? [])].filter((row) => row.provider !== next.provider);
  if (next.connected) list.push(next);
  return list;
}

export function disconnectSocial(
  existing: SocialConnection[] | undefined,
  provider: SocialProvider,
): SocialConnection[] {
  return (existing ?? []).filter((row) => row.provider !== provider);
}

export function socialOf(
  existing: SocialConnection[] | undefined,
  provider: SocialProvider,
): SocialConnection | undefined {
  return existing?.find((row) => row.provider === provider && row.connected);
}

export function legacyFromSocials(socials: SocialConnection[] | undefined): {
  website?: string;
  linkedin?: string;
} {
  const website = socialOf(socials, "website")?.url;
  const linkedin = socialOf(socials, "linkedin")?.url;
  return { website, linkedin };
}

export type OAuthAvailability = Record<"linkedin" | "instagram" | "facebook" | "x", boolean>;

export const EMPTY_OAUTH: OAuthAvailability = {
  linkedin: false,
  instagram: false,
  facebook: false,
  x: false,
};

export function connectModeFor(
  provider: SocialProvider,
  oauth: OAuthAvailability,
): SocialConnectMode {
  if (provider === "linkedin" || provider === "instagram" || provider === "facebook" || provider === "x") {
    return oauth[provider] ? "oauth" : "demo";
  }
  return "demo";
}

export const DEMO_SOCIAL_DISCLOSURE =
  "DEMO connect stores a handle or URL in this preview profile. It is not live OAuth.";

export const LIVE_OAUTH_DISCLOSURE =
  "You will leave this page to authorize. We only keep a public handle.";
