/**
 * Upsert stefanfulks, rickydelvalle, tenthmeridian, and patrickromero.
 *
 * Required env (never commit the values):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   BOOTSTRAP_MEMBER_PASSWORD   (at least 8 characters; not printed)
 *
 * Optional:
 *   BOOTSTRAP_RESET_PASSWORD=true   reset an existing user's password
 *   NEXT_PUBLIC_STREAM_API_KEY + STREAM_API_SECRET   upsert Stream users
 *
 * Apply supabase/migrations/0010_member_usernames.sql first.
 *
 *   npm run bootstrap:members
 */
import {
  readBootstrapPassword,
  shouldResetBootstrapPassword,
} from "@/lib/auth/bootstrap-members";
import { bootstrapFoundingMembersWithAdmin } from "@/lib/auth/bootstrap-supabase";
import { getSupabaseAdmin } from "@/lib/supabase/server";

async function main() {
  const password = readBootstrapPassword();
  if (!password) {
    console.error(
      "Set BOOTSTRAP_MEMBER_PASSWORD to at least 8 characters. The value is never printed.",
    );
    process.exit(1);
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error(
      "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
    );
    process.exit(1);
  }

  const result = await bootstrapFoundingMembersWithAdmin(admin, password, {
    resetPassword: shouldResetBootstrapPassword(),
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error: unknown) => {
  const password = readBootstrapPassword() ?? "";
  const raw = error instanceof Error ? error.message : "Bootstrap failed.";
  console.error(password ? raw.split(password).join("[redacted]") : raw);
  process.exit(1);
});
