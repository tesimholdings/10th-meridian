"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SOCIAL_LEDE } from "@/lib/onboarding/copy";
import {
  DEMO_SOCIAL_DISCLOSURE,
  LIVE_OAUTH_DISCLOSURE,
  OPTIONAL_SOCIALS,
  PRIMARY_SOCIALS,
  connectModeFor,
  disconnectSocial,
  normalizeSocialInput,
  socialMeta,
  socialOf,
  upsertSocial,
  type OAuthAvailability,
  type SocialConnection,
  type SocialProvider,
} from "@/lib/onboarding/socials";

export function SocialChapter({
  socials,
  oauth,
  persistToProfile,
  onChange,
}: {
  socials: SocialConnection[];
  oauth: OAuthAvailability;
  persistToProfile: boolean;
  onChange: (socials: SocialConnection[]) => void;
}) {
  const [open, setOpen] = useState<SocialProvider | null>(null);
  const [more, setMore] = useState(OPTIONAL_SOCIALS.some((row) => socialOf(socials, row.id)));

  return (
    <div>
      <h2 className="font-serif text-3xl text-[var(--navy)]">Connect</h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--navy-soft)]">{SOCIAL_LEDE}</p>
      <p className="mt-3 text-[12px] leading-relaxed text-[var(--ivory-dim)]">{DEMO_SOCIAL_DISCLOSURE}</p>
      <ul className="mt-6 grid gap-2">
        {PRIMARY_SOCIALS.map((row) => (
          <SocialTile
            key={row.id}
            provider={row.id}
            connection={socialOf(socials, row.id)}
            mode={connectModeFor(row.id, oauth)}
            onConnect={() => setOpen(row.id)}
            onDisconnect={() => onChange(disconnectSocial(socials, row.id))}
          />
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 min-h-11 text-sm text-[var(--blue)]"
        onClick={() => setMore((v) => !v)}
      >
        {more ? "Hide optional rooms" : "Add website, WhatsApp, Telegram, YouTube"}
      </button>
      {more ? (
        <ul className="mt-3 grid gap-2">
          {OPTIONAL_SOCIALS.map((row) => (
            <SocialTile
              key={row.id}
              provider={row.id}
              connection={socialOf(socials, row.id)}
              mode="demo"
              onConnect={() => setOpen(row.id)}
              onDisconnect={() => onChange(disconnectSocial(socials, row.id))}
            />
          ))}
        </ul>
      ) : null}
      {open ? (
        <ConnectModal
          provider={open}
          mode={connectModeFor(open, oauth)}
          persistToProfile={persistToProfile}
          current={socialOf(socials, open)}
          onClose={() => setOpen(null)}
          onSave={(row) => {
            onChange(upsertSocial(socials, row));
            setOpen(null);
          }}
        />
      ) : null}
    </div>
  );
}

function SocialTile({
  provider,
  connection,
  mode,
  onConnect,
  onDisconnect,
}: {
  provider: SocialProvider;
  connection?: SocialConnection;
  mode: "demo" | "oauth";
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const meta = socialMeta(provider);
  const connected = Boolean(connection?.connected);
  return (
    <li className={`social-tile ${connected ? "social-tile-on" : ""}`}>
      <div className="min-w-0">
        <p className="font-medium text-[var(--navy)]">{meta.label}</p>
        <p className="truncate text-[12px] text-[var(--ivory-dim)]">
          {connected
            ? connection?.handle || connection?.url || "Connected"
            : meta.example}
        </p>
        <p className="mt-1 text-[10px] tracking-[0.16em] uppercase text-[var(--gold-dim)]">
          {connected ? (connection?.mode === "oauth" ? "OAuth" : "DEMO") : mode === "oauth" ? "OAuth ready" : "DEMO"}
        </p>
      </div>
      {connected ? (
        <button type="button" className="action-quiet shrink-0" onClick={onDisconnect}>
          Disconnect
        </button>
      ) : (
        <button type="button" className="action-quiet shrink-0" onClick={onConnect}>
          Connect
        </button>
      )}
    </li>
  );
}

function ConnectModal({
  provider,
  mode,
  persistToProfile,
  current,
  onClose,
  onSave,
}: {
  provider: SocialProvider;
  mode: "demo" | "oauth";
  persistToProfile: boolean;
  current?: SocialConnection;
  onClose: () => void;
  onSave: (row: SocialConnection) => void;
}) {
  const meta = socialMeta(provider);
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(current?.handle || current?.url || "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function save(nextMode: "demo" | "oauth" = "demo") {
    const parsed = normalizeSocialInput(provider, value);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    const row: SocialConnection = {
      provider,
      handle: parsed.handle,
      url: parsed.url,
      connected: true,
      mode: nextMode,
      connectedAt: new Date().toISOString(),
    };
    if (persistToProfile) {
      setBusy(true);
      const res = await fetch("/api/profile/socials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect", ...row }),
      });
      setBusy(false);
      if (!res.ok) {
        setError("Could not save to the DEMO profile store.");
        return;
      }
    }
    onSave(row);
  }

  async function startOAuth() {
    setBusy(true);
    const res = await fetch(`/api/auth/oauth/${provider}`);
    const json = (await res.json()) as { ok?: boolean; mode?: string; authorizeUrl?: string; message?: string };
    setBusy(false);
    if (json.authorizeUrl) {
      window.location.assign(json.authorizeUrl);
      return;
    }
    setError(json.message ?? "Live OAuth is not configured. Use DEMO connect below.");
  }

  return (
    <div className="experience-modal" role="presentation">
      <button type="button" className="experience-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="experience-modal-card"
      >
        <p id={titleId} className="font-serif text-2xl text-[var(--navy)]">
          Connect {meta.label}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--navy-soft)]">
          {mode === "oauth" ? LIVE_OAUTH_DISCLOSURE : DEMO_SOCIAL_DISCLOSURE}
        </p>
        {mode === "oauth" ? (
          <Button className="mt-5 w-full" disabled={busy} onClick={() => void startOAuth()}>
            Continue to {meta.label}
          </Button>
        ) : null}
        <label className="mt-5 grid gap-1.5">
          <span className="label">{meta.label} handle or URL</span>
          <input
            ref={inputRef}
            value={value}
            placeholder={meta.placeholder}
            onChange={(e) => setValue(e.target.value)}
          />
          <span className="text-[12px] leading-relaxed text-[var(--ivory-dim)]">{meta.helper}</span>
        </label>
        {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}
        <div className="mt-6 flex gap-3">
          <Button variant="quiet" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={busy} onClick={() => void save(mode === "oauth" ? "demo" : "demo")}>
            {mode === "oauth" ? "Save handle instead" : "Save to profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
