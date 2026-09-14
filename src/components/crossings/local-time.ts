/** Convert the form's destination wall time, independent of the browser timezone. */
export function destinationTimeToIso(value: string, timeZone: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error("Choose a date and time for your table.");
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
  } catch {
    throw new Error(
      "Choose a valid destination timezone, such as Europe/London.",
    );
  }
  const partsAt = (instant: number) => {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(instant)).map((p) => [p.type, p.value]),
    );
    return Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
    );
  };
  const offsets = new Set(
    [-36, 0, 36].map((hours) => {
      const probe = wall + hours * 3600000;
      return partsAt(probe) - probe;
    }),
  );
  const candidates = [...offsets]
    .map((offset) => wall - offset)
    .filter((instant) => partsAt(instant) === wall);
  if (candidates.length === 0)
    throw new Error(
      "That local time is skipped by a daylight-saving change. Choose another time.",
    );
  if (candidates.length > 1)
    throw new Error(
      "That local time occurs twice during a daylight-saving change. Choose another time.",
    );
  return new Date(candidates[0]).toISOString();
}

export function friendlyDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function friendlyTableTime(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(value));
}
