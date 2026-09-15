/** Guest lock atmosphere: grainy black + gold only. No photographs. */

export function LockField({ children }: { children: React.ReactNode }) {
  return (
    <div className="lock-field relative min-h-dvh overflow-hidden text-ivory">
      <div className="lock-field-base" aria-hidden />
      <div className="lock-field-gold" aria-hidden />
      <div className="lock-grain" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
