/**
 * Deterministic Stream channel ids. Used by server token helpers and the
 * demo compose path so DMs stay addressable when keys are missing.
 */

export function directMessageChannelId(a: string, b: string): string {
  const [left, right] = [a, b].sort();
  return `dm-${left}-${right}`;
}

export function houseChannelId(slug: string): string {
  return `channel-${slug}`;
}

export function streamChannelCid(
  kind: "messaging" | "team",
  id: string,
): string {
  return `${kind}:${id}`;
}
