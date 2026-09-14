import { MeridianMark } from "@/components/brand/mark";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="panel p-7 md:p-8">
      <MeridianMark className="h-10 w-10 opacity-70" />
      <p className="mt-5 font-serif text-3xl leading-tight">{title}</p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Finding where paths may cross…" }: { label?: string }) {
  return (
    <div className="panel p-6" role="status">
      <p className="label">{label}</p>
      <div className="editorial-rule mt-5" />
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="panel p-6" role="alert" style={{ borderColor: "rgba(180, 85, 74, 0.45)" }}>
      <p className="label" style={{ color: "var(--danger)" }}>A pause</p>
      <p className="mt-3 font-serif text-2xl">The house could not complete that.</p>
      <p className="mt-2 text-sm leading-relaxed text-ivory-muted">{message}</p>
    </div>
  );
}

export function OfflineState() {
  return (
    <EmptyState
      title="The wire is quiet."
      body="Crossings will wait. City-level presence is never real-time location — when you return, your journeys will still be here."
    />
  );
}

export function PrivacyNotice() {
  return (
    <p className="text-[11px] leading-relaxed tracking-[0.04em] text-ivory-dim">
      City-level presence only. Crossings is not real-time location sharing. Flight numbers, hotel
      stays, room numbers, and detailed itineraries are never collected. SYNTHETIC DEMO.
    </p>
  );
}
