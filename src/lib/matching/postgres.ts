import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  computeMatchIndex,
  type MatchIndex,
  type MatchServiceInput,
} from "@/lib/matching/service";

export type MatchSource = "postgres" | "typescript";

export type HybridMatchIndex = MatchIndex & {
  source: MatchSource;
  persisted: boolean;
};

/**
 * Hybrid Meridian matching.
 * Always scores in TypeScript from the supplied member records (preview/demo
 * safe; never invents people). When a Supabase service role is present and the
 * viewer id is a UUID, also persist via `recalculate_matches_for` so
 * `meridian_10` / `meridian_100` views stay warm.
 */
export async function loadHybridMatchIndex(
  input: MatchServiceInput,
): Promise<HybridMatchIndex> {
  const computed = await computeMatchIndex(input);
  const persisted = await tryPersistPostgres(input.viewer.id);
  return {
    ...computed,
    source: persisted ? "postgres" : "typescript",
    persisted,
  };
}

export async function tryPersistPostgres(viewerId: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) return false;
  if (!isUuid(viewerId)) return false;
  try {
    const { error } = await admin.rpc("recalculate_matches_for", {
      p_viewer: viewerId,
    });
    return !error;
  } catch {
    return false;
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export { isUuid as isPostgresProfileId };
