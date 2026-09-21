import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bearerToken,
  bootstrapAccess,
  bootstrapFoundingMembers,
  readBootstrapPassword,
  type BootstrapPorts,
  type BootstrapUserInput,
} from "@/lib/auth/bootstrap-members";

const FIXTURE_PASSWORD = "fixture-not-a-secret";

function ports(options?: {
  existingEmail?: string;
  stream?: "upserted" | "skipped";
}): {
  ports: BootstrapPorts;
  created: BootstrapUserInput[];
  streamIds: string[];
} {
  const created: BootstrapUserInput[] = [];
  const streamIds: string[] = [];
  return {
    created,
    streamIds,
    ports: {
      findByEmail: async (email) =>
        options?.existingEmail === email ? { id: `existing-${email}` } : null,
      createUser: async (input) => {
        created.push(input);
        return { id: `auth-${input.user_metadata.username}` };
      },
      updateUser: async () => {},
      upsertAccount: async (input) => ({ id: `acc-${input.username}` }),
      upsertProfile: async (input) => ({ id: `pro-${input.username}` }),
      upsertStream: async (input) => {
        streamIds.push(input.id);
        return options?.stream ?? "upserted";
      },
    },
  };
}

describe("founding member bootstrap", () => {
  it("creates both users from the password argument and confirms email", async () => {
    const harness = ports();
    const result = await bootstrapFoundingMembers(harness.ports, FIXTURE_PASSWORD);

    assert.equal(result.ok, true);
    assert.deepEqual(
      result.members.map((member) => member.username),
      ["stefanfulks", "rickydelvalle"],
    );
    assert.equal(result.members[0]?.role, "administrator");
    assert.equal(result.members[1]?.role, "member");
    assert.equal(result.members[0]?.auth, "created");
    assert.equal(harness.created.length, 2);
    assert.equal(harness.created[0]?.email_confirm, true);
    assert.equal(harness.created[0]?.user_metadata.username, "stefanfulks");
    assert.equal(harness.created[0]?.user_metadata.name, "Stefan Fulks");
    assert.equal(harness.created[1]?.user_metadata.name, "Ricky Del Valle");
    assert.equal(harness.created[0]?.password, FIXTURE_PASSWORD);
    assert.equal(JSON.stringify(result).includes(FIXTURE_PASSWORD), false);
    assert.deepEqual(harness.streamIds, [
      "acc-stefanfulks",
      "pro-stefanfulks",
      "acc-rickydelvalle",
      "pro-rickydelvalle",
    ]);
  });

  it("updates an existing auth user without putting the password in the result", async () => {
    const harness = ports({ existingEmail: "stefanfulks@tenmeridian.com" });
    const updates: string[] = [];
    harness.ports.updateUser = async (id) => {
      updates.push(id);
    };
    const result = await bootstrapFoundingMembers(harness.ports, FIXTURE_PASSWORD, {
      resetPassword: false,
    });
    assert.equal(result.members[0]?.auth, "updated");
    assert.deepEqual(updates, ["existing-stefanfulks@tenmeridian.com"]);
    assert.equal(harness.created.length, 1);
    assert.equal(harness.created[0]?.user_metadata.username, "rickydelvalle");
    assert.equal(JSON.stringify(result).includes(FIXTURE_PASSWORD), false);
  });

  it("reads the password only from BOOTSTRAP_MEMBER_PASSWORD", () => {
    assert.equal(readBootstrapPassword({}), null);
    assert.equal(readBootstrapPassword({ BOOTSTRAP_MEMBER_PASSWORD: "short" }), null);
    assert.equal(
      readBootstrapPassword({ BOOTSTRAP_MEMBER_PASSWORD: FIXTURE_PASSWORD }),
      FIXTURE_PASSWORD,
    );
  });

  it("hides the one-shot route unless the bearer token matches", () => {
    const token = "bootstrap-token-value";
    assert.equal(
      bootstrapAccess({
        enabled: undefined,
        expectedToken: token,
        presentedToken: token,
      }),
      "hidden",
    );
    assert.equal(
      bootstrapAccess({
        enabled: "true",
        expectedToken: "too-short",
        presentedToken: "too-short",
      }),
      "hidden",
    );
    assert.equal(
      bootstrapAccess({
        enabled: "true",
        expectedToken: token,
        presentedToken: "bootstrap-token-other",
      }),
      "hidden",
    );
    assert.equal(
      bootstrapAccess({
        enabled: "true",
        expectedToken: token,
        presentedToken: bearerToken(`Bearer ${token}`),
      }),
      "allow",
    );
  });
});
