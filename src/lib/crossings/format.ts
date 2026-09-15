/** Human-readable travel dates. Never raw ISO in member-facing Crossings. */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parts(isoDate: string): { y: number; m: number; d: number } | null {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

export function formatHumanDate(isoDate: string): string {
  const p = parts(isoDate);
  if (!p) return isoDate;
  return `${MONTHS[p.m - 1]} ${p.d}, ${p.y}`;
}

export function formatHumanDateRange(start: string, end: string): string {
  const a = parts(start);
  const b = parts(end);
  if (!a || !b) return `${start} – ${end}`;
  if (a.y === b.y && a.m === b.m) {
    return `${MONTHS[a.m - 1]} ${a.d}–${b.d}, ${a.y}`;
  }
  if (a.y === b.y) {
    return `${MONTHS[a.m - 1]} ${a.d} – ${MONTHS[b.m - 1]} ${b.d}, ${a.y}`;
  }
  return `${formatHumanDate(start)} – ${formatHumanDate(end)}`;
}

export function formatHumanDateTime(iso: string, timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: timeZone && timeZone.length > 0 ? timeZone : undefined,
      timeZoneName: timeZone ? "short" : undefined,
    }).format(date);
  } catch {
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
}

export function formatRelativeTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const delta = now.getTime() - date.getTime();
  const minutes = Math.round(delta / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return formatHumanDate(iso.slice(0, 10));
}
