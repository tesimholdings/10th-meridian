import type { SupabaseClient } from "@supabase/supabase-js";
import {
  bootstrapFoundingMembers,
  type BootstrapPorts,
  type BootstrapMemberResult,
} from "@/lib/auth/bootstrap-members";
import type { AppRole } from "@/lib/data/types";
import { upsertStreamMember } from "@/lib/stream/users";

type AccountWrite = {
  userId: string;
  email: string;
  username: string;
  name: string;
  role: AppRole;
};

function columnMissing(message: string): boolean {
  return /username|role/i.test(message) && /column|schema/i.test(message);
}

async function findAuthUserId(admin: SupabaseClient, email: string): Promise<string | null> {
  const target = email.trim().toLowerCase();
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const users = data?.users ?? [];
    const hit = users.find((user) => (user.email ?? "").toLowerCase() === target);
    if (hit?.id) return hit.id;
    if (users.length < 200) return null;
  }
  return null;
}

async function upsertAccount(admin: SupabaseClient, input: AccountWrite): Promise<{ id: string }> {
  const byUser = await admin
    .from("accounts")
    .select("id")
    .eq("user_id", input.userId)
    .maybeSingle();
  if (byUser.error) throw new Error(byUser.error.message);

  const byEmail = byUser.data
    ? null
    : await admin.from("accounts").select("id").ilike("email", input.email).maybeSingle();
  if (byEmail?.error) throw new Error(byEmail.error.message);

  const existing = byUser.data ?? byEmail?.data ?? null;

  const row = {
    user_id: input.userId,
    email: input.email,
    full_name: input.name,
    role: input.role,
    username: input.username,
    is_demo: false,
  };

  if (existing?.id) {
    const { error } = await admin.from("accounts").update(row).eq("id", existing.id);
    if (error) {
      if (columnMissing(error.message)) {
        throw new Error(
          "accounts.username is missing. Apply supabase/migrations/0010_member_usernames.sql.",
        );
      }
      throw new Error(error.message);
    }
    return { id: existing.id };
  }

  const { data, error } = await admin.from("accounts").insert(row).select("id").single();
  if (error || !data?.id) {
    if (error && columnMissing(error.message)) {
      throw new Error(
        "accounts.username is missing. Apply supabase/migrations/0010_member_usernames.sql.",
      );
    }
    throw new Error(error?.message ?? "Could not create the account row.");
  }
  return { id: data.id };
}

async function upsertProfile(
  admin: SupabaseClient,
  input: { accountId: string; username: string; name: string; role: AppRole },
): Promise<{ id: string }> {
  const { data: existing, error: readError } = await admin
    .from("profiles")
    .select("id")
    .eq("account_id", input.accountId)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  const row = {
    account_id: input.accountId,
    display_name: input.name,
    username: input.username,
    role: input.role,
    is_demo: false,
    visibility: "members",
  };

  if (existing?.id) {
    const { error } = await admin.from("profiles").update(row).eq("id", existing.id);
    if (error) {
      if (columnMissing(error.message)) {
        throw new Error(
          "profiles.username or profiles.role is missing. Apply supabase/migrations/0010_member_usernames.sql.",
        );
      }
      throw new Error(error.message);
    }
    return { id: existing.id };
  }

  const inserted = await admin
    .from("profiles")
    .insert({ ...row, onboarding_completed_at: new Date().toISOString() })
    .select("id")
    .single();
  if (!inserted.error && inserted.data?.id) return { id: inserted.data.id };

  const missingOnboarding =
    inserted.error && /onboarding_completed_at/i.test(inserted.error.message);
  const { data, error } = missingOnboarding
    ? await admin.from("profiles").insert(row).select("id").single()
    : inserted;
  if (error || !data?.id) {
    if (error && columnMissing(error.message)) {
      throw new Error(
        "profiles.username or profiles.role is missing. Apply supabase/migrations/0010_member_usernames.sql.",
      );
    }
    throw new Error(error?.message ?? "Could not create the profile row.");
  }
  return { id: data.id };
}

export function portsForSupabase(admin: SupabaseClient): BootstrapPorts {
  return {
    findByEmail: async (email) => {
      const id = await findAuthUserId(admin, email);
      return id ? { id } : null;
    },
    createUser: async (input) => {
      const { data, error } = await admin.auth.admin.createUser(input);
      if (error || !data.user?.id) {
        throw new Error(error?.message ?? "Auth user was not created.");
      }
      return { id: data.user.id };
    },
    updateUser: async (id, input) => {
      const { error } = await admin.auth.admin.updateUserById(id, input);
      if (error) throw new Error(error.message);
    },
    upsertAccount: (input) => upsertAccount(admin, input),
    upsertProfile: (input) => upsertProfile(admin, input),
    upsertStream: (input) => upsertStreamMember(input),
  };
}

export async function bootstrapFoundingMembersWithAdmin(
  admin: SupabaseClient,
  password: string,
  options?: { resetPassword?: boolean },
): Promise<{ ok: true; members: BootstrapMemberResult[] }> {
  return bootstrapFoundingMembers(portsForSupabase(admin), password, options);
}
