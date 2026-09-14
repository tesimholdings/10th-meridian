import type { CircleEdge, IndexRemoval } from "@/lib/network/types";

export function circleIdsFor(ownerId: string, edges: CircleEdge[]): string[] {
  return edges.filter((e) => e.ownerId === ownerId).map((e) => e.memberId);
}

export function isInCircle(ownerId: string, memberId: string, edges: CircleEdge[]): boolean {
  return edges.some((e) => e.ownerId === ownerId && e.memberId === memberId);
}

export function addToCircle(
  edges: CircleEdge[],
  ownerId: string,
  memberId: string,
  at = new Date().toISOString(),
): { edges: CircleEdge[]; added: boolean } {
  if (ownerId === memberId) return { edges, added: false };
  if (isInCircle(ownerId, memberId, edges)) return { edges, added: false };
  return {
    edges: [...edges, { ownerId, memberId, addedAt: at }],
    added: true,
  };
}

export function removeFromCircle(
  edges: CircleEdge[],
  ownerId: string,
  memberId: string,
): { edges: CircleEdge[]; removed: boolean } {
  const next = edges.filter((e) => !(e.ownerId === ownerId && e.memberId === memberId));
  return { edges: next, removed: next.length !== edges.length };
}

export function isRemovedFromIndex(
  viewerId: string,
  targetId: string,
  removals: IndexRemoval[],
): boolean {
  return removals.some((r) => r.viewerId === viewerId && r.targetId === targetId);
}

export function removeFromIndex(
  removals: IndexRemoval[],
  viewerId: string,
  targetId: string,
  at = new Date().toISOString(),
): { removals: IndexRemoval[]; removed: boolean } {
  if (viewerId === targetId) return { removals, removed: false };
  if (isRemovedFromIndex(viewerId, targetId, removals)) return { removals, removed: false };
  return {
    removals: [...removals, { viewerId, targetId, removedAt: at }],
    removed: true,
  };
}

export function restoreToIndex(
  removals: IndexRemoval[],
  viewerId: string,
  targetId: string,
): { removals: IndexRemoval[]; restored: boolean } {
  const next = removals.filter((r) => !(r.viewerId === viewerId && r.targetId === targetId));
  return { removals: next, restored: next.length !== removals.length };
}
