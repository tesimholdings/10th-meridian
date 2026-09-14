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
    <div className="empty-state">
      <p className="font-serif text-2xl">{title}</p>
      <p className="mt-2 max-w-md text-sm text-ivory-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingState({
  label = "Finding where paths may cross…",
}: {
  label?: string;
}) {
  return (
    <p
      className="text-sm tracking-[0.16em] uppercase text-ivory-dim"
      role="status"
    >
      {label}
    </p>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <p
      className="border border-[var(--danger)] p-4 text-sm text-ivory-muted"
      role="alert"
    >
      {message}
    </p>
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
      City-level presence, never live location. Choose who can see each journey.
      SYNTHETIC DEMO.
    </p>
  );
}
