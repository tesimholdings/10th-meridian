import { timingSafeEqual } from "node:crypto";
import {
  FOUNDING_MEMBERS,
  foundingAuthMetadata,
  type FoundingMember,
} from "@/lib/auth/members";
import type { AppRole } from "@/lib/data/types";

export const BOOTSTRAP_PASSWORD_ENV = "BOOTSTRAP_MEMBER_PASSWORD";
export const BOOTSTRAP_TOKEN_ENV = "BOOTSTRAP_MEMBER_TOKEN";
export const BOOTSTRAP_ENABLED_ENV = "BOOTSTRAP_MEMBERS_ENABLED";
export const BOOTSTRAP_RESET_PASSWORD_ENV = "BOOTSTRAP_RESET_PASSWORD";

const MIN_PASSWORD_LENGTH = 8;
const MIN_TOKEN_LENGTH = 16;

export type BootstrapAuthState = "created" | "updated";
export type BootstrapStreamState = "upserted" | "skipped" | "failed";

export type BootstrapMemberResult = {
  username: string;
  email: string;
  name: string;
  role: AppRole;
  auth: BootstrapAuthState;
  accountId: string;
  profileId: string;
  stream: BootstrapStreamState;
};

export type BootstrapUserInput = {
  email: string;
  password: string;
  email_confirm: true;
  user_metadata: ReturnType<typeof foundingAuthMetadata>;
};

export type BootstrapUpdateInput = {
  email_confirm: true;
  user_metadata: ReturnType<typeof foundingAuthMetadata>;
  password?: string;
};

export type BootstrapPorts = {
  findByEmail: (email: string) => Promise<{ id: string } | null>;
  createUser: (input: BootstrapUserInput) => Promise<{ id: string }>;
  updateUser: (id: string, input: BootstrapUpdateInput) => Promise<void>;
  upsertAccount: (input: {
    userId: string;
    email: string;
    username: string;
    name: string;
    role: AppRole;
  }) => Promise<{ id: string }>;
  upsertProfile: (input: {
    accountId: string;
    username: string;
    name: string;
    role: AppRole;
  }) => Promise<{ id: string }>;
  upsertStream: (input: { id: string; name: string }) => Promise<"upserted" | "skipped">;
};

export function readBootstrapPassword(
  source: Record<string, string | undefined> = process.env,
): string | null {
  const value = source[BOOTSTRAP_PASSWORD_ENV]?.trim() ?? "";
  if (value.length < MIN_PASSWORD_LENGTH) return null;
  return value;
}

export function shouldResetBootstrapPassword(
  source: Record<string, string | undefined> = process.env,
): boolean {
  const raw = source[BOOTSTRAP_RESET_PASSWORD_ENV]?.trim().toLowerCase() ?? "";
  return raw === "true" || raw === "1" || raw === "yes";
}

export function tokensMatch(presented: string, expected: string): boolean {
  const left = Buffer.from(presented);
  const right = Buffer.from(expected);
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Hidden unless explicitly enabled and the bearer token matches. */
export function bootstrapAccess(input: {
  enabled: string | undefined;
  expectedToken: string | undefined;
  presentedToken: string;
}): "allow" | "hidden" {
  if (input.enabled !== "true") return "hidden";
  const expected = input.expectedToken?.trim() ?? "";
  if (expected.length < MIN_TOKEN_LENGTH) return "hidden";
  if (!tokensMatch(input.presentedToken, expected)) return "hidden";
  return "allow";
}

export function bearerToken(header: string | null): string {
  if (!header) return "";
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header);
  return match?.[1] ?? "";
}

function redact(message: string, password: string): string {
  if (!password) return message;
  return message.split(password).join("[redacted]");
}

async function ensureAuthUser(
  ports: BootstrapPorts,
  member: FoundingMember,
  password: string,
  resetPassword: boolean,
): Promise<{ id: string; auth: BootstrapAuthState }> {
  const metadata = foundingAuthMetadata(member);
  const existing = await ports.findByEmail(member.email);
  if (!existing) {
    try {
      const created = await ports.createUser({
        email: member.email,
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      return { id: created.id, auth: "created" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "create failed";
      if (!/already|registered|exists/i.test(message)) {
        throw new Error(redact(message, password));
      }
      const again = await ports.findByEmail(member.email);
      if (!again) throw new Error(redact(message, password));
      await ports.updateUser(again.id, {
        email_confirm: true,
        user_metadata: metadata,
        ...(resetPassword ? { password } : {}),
      });
      return { id: again.id, auth: "updated" };
    }
  }

  await ports.updateUser(existing.id, {
    email_confirm: true,
    user_metadata: metadata,
    ...(resetPassword ? { password } : {}),
  });
  return { id: existing.id, auth: "updated" };
}

export async function bootstrapFoundingMembers(
  ports: BootstrapPorts,
  password: string,
  options?: { resetPassword?: boolean },
): Promise<{ ok: true; members: BootstrapMemberResult[] }> {
  if (password.trim().length < MIN_PASSWORD_LENGTH) {
    throw new Error(`${BOOTSTRAP_PASSWORD_ENV} is missing.`);
  }

  const resetPassword = options?.resetPassword ?? false;
  const members: BootstrapMemberResult[] = [];

  for (const member of FOUNDING_MEMBERS) {
    const auth = await ensureAuthUser(ports, member, password, resetPassword);
    const account = await ports.upsertAccount({
      userId: auth.id,
      email: member.email,
      username: member.username,
      name: member.name,
      role: member.role,
    });
    const profile = await ports.upsertProfile({
      accountId: account.id,
      username: member.username,
      name: member.name,
      role: member.role,
    });

    let stream: BootstrapStreamState = "skipped";
    try {
      stream = await ports.upsertStream({ id: account.id, name: member.name });
      if (profile.id !== account.id) {
        const profileStream = await ports.upsertStream({
          id: profile.id,
          name: member.name,
        });
        if (profileStream === "upserted") stream = "upserted";
      }
    } catch {
      stream = "failed";
    }

    members.push({
      username: member.username,
      email: member.email,
      name: member.name,
      role: member.role,
      auth: auth.auth,
      accountId: account.id,
      profileId: profile.id,
      stream,
    });
  }

  return { ok: true, members };
}
