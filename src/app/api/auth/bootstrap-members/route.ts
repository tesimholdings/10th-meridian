import {
  bearerToken,
  bootstrapAccess,
  BOOTSTRAP_ENABLED_ENV,
  BOOTSTRAP_PASSWORD_ENV,
  BOOTSTRAP_TOKEN_ENV,
  readBootstrapPassword,
  shouldResetBootstrapPassword,
} from "@/lib/auth/bootstrap-members";
import { bootstrapFoundingMembersWithAdmin } from "@/lib/auth/bootstrap-supabase";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * One-shot member bootstrap. Hidden unless BOOTSTRAP_MEMBERS_ENABLED=true
 * and Authorization: Bearer $BOOTSTRAP_MEMBER_TOKEN (16+ characters).
 * Password comes only from BOOTSTRAP_MEMBER_PASSWORD and is never returned.
 */
export async function POST(request: Request) {
  const presented = bearerToken(request.headers.get("authorization"));
  const access = bootstrapAccess({
    enabled: process.env[BOOTSTRAP_ENABLED_ENV],
    expectedToken: process.env[BOOTSTRAP_TOKEN_ENV],
    presentedToken: presented,
  });
  if (access === "hidden") {
    return new Response(null, { status: 404 });
  }

  const password = readBootstrapPassword();
  if (!password) {
    return Response.json(
      { ok: false, message: `${BOOTSTRAP_PASSWORD_ENV} is not set.` },
      { status: 503 },
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return Response.json(
      { ok: false, message: "Supabase service role is not configured." },
      { status: 503 },
    );
  }

  try {
    const result = await bootstrapFoundingMembersWithAdmin(admin, password, {
      resetPassword: shouldResetBootstrapPassword(),
    });
    return Response.json(result);
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Bootstrap failed.";
    const message = raw.split(password).join("[redacted]");
    return Response.json({ ok: false, message }, { status: 500 });
  }
}
