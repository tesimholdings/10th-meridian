import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emailCandidateFromIdentity } from "@/lib/lock/unlock";
import {
  chooseSignInEmail,
  foundingAuthMetadata,
  foundingMemberForHandle,
  FOUNDING_MEMBERS,
  isPreviewDemoEmail,
  pathAfterPasswordLogin,
  resolveSessionRole,
} from "@/lib/auth/members";

describe("real member identity", () => {
  it("maps founding usernames to live emails, not preview aliases", () => {
    assert.equal(
      emailCandidateFromIdentity("stefanfulks"),
      "stefan.fulks@preview.10thmeridian.test",
    );

    const stefan = chooseSignInEmail(
      "stefanfulks",
      { accountEmail: null, metadataEmail: null },
      { supabaseConfigured: true },
    );
    assert.equal(stefan, "stefanfulks@tenmeridian.com");
    assert.equal(isPreviewDemoEmail(stefan), false);

    const ricky = chooseSignInEmail(
      "RickyDelValle",
      { accountEmail: null, metadataEmail: null },
      { supabaseConfigured: true },
    );
    assert.equal(ricky, "rickydelvalle@tenmeridian.com");
    assert.equal(
      chooseSignInEmail(
        "tenthmeridian",
        { accountEmail: null, metadataEmail: null },
        { supabaseConfigured: true },
      ),
      "tenthmeridian@tenmeridian.com",
    );
    assert.equal(
      chooseSignInEmail(
        "patrickromero",
        { accountEmail: null, metadataEmail: null },
        { supabaseConfigured: true },
      ),
      "patrickromero@tenmeridian.com",
    );
  });

  it("prefers a username column or auth metadata over the directory", () => {
    assert.equal(
      chooseSignInEmail(
        "stefanfulks",
        { accountEmail: "stefanfulks@tenmeridian.com", metadataEmail: null },
        { supabaseConfigured: true },
      ),
      "stefanfulks@tenmeridian.com",
    );
    assert.equal(
      chooseSignInEmail(
        "stefanfulks",
        { accountEmail: null, metadataEmail: "alias@tenmeridian.com" },
        { supabaseConfigured: true },
      ),
      "alias@tenmeridian.com",
    );
  });

  it("accepts an email as typed and refuses unknown usernames on Supabase", () => {
    assert.equal(
      chooseSignInEmail(
        "person@tenmeridian.com",
        { accountEmail: null, metadataEmail: null },
        { supabaseConfigured: true },
      ),
      "person@tenmeridian.com",
    );
    assert.equal(
      chooseSignInEmail(
        "stefan",
        { accountEmail: null, metadataEmail: null },
        { supabaseConfigured: true },
      ),
      "",
    );
  });

  it("gives Stefan the steward role and Ricky member", () => {
    assert.equal(foundingMemberForHandle("stefanfulks")?.role, "administrator");
    assert.equal(foundingMemberForHandle("rickydelvalle")?.role, "member");
    assert.equal(foundingMemberForHandle("tenthmeridian")?.role, "administrator");
    assert.equal(
      foundingMemberForHandle("tenthmeridian")?.authUserId,
      "1f8b496d-38f4-4346-9cc2-080d335a3fbf",
    );
    assert.equal(foundingMemberForHandle("patrickromero")?.role, "member");
    assert.equal(
      foundingMemberForHandle("patrickromero@tenmeridian.com")?.authUserId,
      "9b67ed84-74ff-433a-8cab-d992f3992986",
    );
    assert.equal(resolveSessionRole({ username: "tenthmeridian" }), "administrator");
    assert.equal(resolveSessionRole({ email: "patrickromero@tenmeridian.com" }), "member");
    assert.equal(
      resolveSessionRole({
        profileRole: "administrator",
        accountRole: "member",
        email: "stefanfulks@tenmeridian.com",
      }),
      "administrator",
    );
    assert.equal(
      resolveSessionRole({
        profileRole: null,
        accountRole: "guest",
        username: "stefanfulks",
      }),
      "administrator",
    );
    assert.equal(
      resolveSessionRole({
        metadataRole: "steward",
        email: "someone@tenmeridian.com",
      }),
      "administrator",
    );
    assert.equal(
      resolveSessionRole({ username: "rickydelvalle" }),
      "member",
    );
  });

  it("opens the member shell after a real password login", () => {
    assert.equal(pathAfterPasswordLogin("administrator"), "/member/home");
    assert.equal(pathAfterPasswordLogin("member"), "/member/home");
    assert.equal(pathAfterPasswordLogin("approved_unpaid"), "/member/billing");
  });

  it("puts username and name on auth metadata and never a password", () => {
    const stefan = FOUNDING_MEMBERS[0];
    const ricky = FOUNDING_MEMBERS[1];
    assert.ok(stefan && ricky);
    assert.deepEqual(foundingAuthMetadata(stefan), {
      username: "stefanfulks",
      name: "Stefan Fulks",
      full_name: "Stefan Fulks",
      role: "administrator",
    });
    assert.equal(foundingAuthMetadata(ricky).name, "Ricky Del Valle");
    assert.equal(foundingAuthMetadata(FOUNDING_MEMBERS[2]!).name, "Tenth Meridian");
    assert.equal(foundingAuthMetadata(FOUNDING_MEMBERS[3]!).name, "Patrick Romero");
    assert.equal(FOUNDING_MEMBERS.map((member) => member.username).join(","), 
      "stefanfulks,rickydelvalle,tenthmeridian,patrickromero");
    assert.equal(JSON.stringify(FOUNDING_MEMBERS).includes("password"), false);
  });
});
