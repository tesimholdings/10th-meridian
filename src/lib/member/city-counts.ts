export function cityCountLines(input: {
  city: string;
  travelers: number;
  locals: number;
  hosts: number;
}): string[] {
  const city = input.city.trim() || "this city";
  const lines: string[] = [];
  if (input.travelers > 0) {
    const noun = input.travelers === 1 ? "member" : "members";
    lines.push(`${input.travelers} ${noun} will be in ${city} while you are.`);
  }
  if (input.locals > 0) {
    const noun = input.locals === 1 ? "member lives" : "members live";
    lines.push(`${input.locals} ${noun} in ${city}.`);
  }
  if (input.hosts > 0) {
    const noun = input.hosts === 1 ? "City Host" : "City Hosts";
    lines.push(`${input.hosts} ${noun} can welcome you in ${city}.`);
  }
  if (lines.length === 0) {
    lines.push(`No other members are in ${city} on an overlapping trip.`);
  }
  return lines;
}
