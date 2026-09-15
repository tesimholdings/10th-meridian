export function NavIcon({ id, active }: { id: string; active: boolean }) {
  const stroke = active ? "var(--gold)" : "currentColor";
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      {id === "home" ? (
        <path d="M3.5 10 L10 4 L16.5 10 V16.5 H3.5 Z" fill="none" stroke={stroke} strokeWidth="1.4" />
      ) : null}
      {id === "circle" || id === "index" ? (
        <>
          <circle cx="7" cy="8" r="2.2" fill="none" stroke={stroke} strokeWidth="1.4" />
          <circle cx="13.5" cy="8.5" r="1.8" fill="none" stroke={stroke} strokeWidth="1.4" />
          <path d="M3.8 15.2 C4.4 12.6 9.6 12.6 10.2 15.2" fill="none" stroke={stroke} strokeWidth="1.4" />
        </>
      ) : null}
      {id === "messages" ? (
        <path
          d="M4 5.5 H16 V13.5 H8 L4 16.2 Z"
          fill="none"
          stroke={stroke}
          strokeWidth="1.4"
        />
      ) : null}
      {id === "crossings" ? (
        <>
          <path d="M4 14.5 C7 8.5, 13 8.5, 16 14.5" fill="none" stroke={stroke} strokeWidth="1.4" />
          <circle cx="10" cy="7" r="2" fill="none" stroke={stroke} strokeWidth="1.4" />
        </>
      ) : null}
      {id === "profile" ? (
        <>
          <circle cx="10" cy="7.2" r="2.3" fill="none" stroke={stroke} strokeWidth="1.4" />
          <path d="M5 16 C5.6 12.6 14.4 12.6 15 16" fill="none" stroke={stroke} strokeWidth="1.4" />
        </>
      ) : null}
    </svg>
  );
}
