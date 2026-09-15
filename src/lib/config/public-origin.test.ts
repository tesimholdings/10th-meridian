import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPublicHttpOrigin, resolvePublicOrigin } from "@/lib/config/public-origin";

describe("public origin", () => {
  it("rejects localhost and loopback", () => {
    assert.equal(isPublicHttpOrigin("http://localhost:3000"), false);
    assert.equal(isPublicHttpOrigin("http://127.0.0.1:3000"), false);
    assert.equal(isPublicHttpOrigin("https://10th-meridian-preview.vercel.app"), true);
  });

  it("prefers a configured public URL, then the current Vercel host", () => {
    assert.equal(
      resolvePublicOrigin({
        appUrl: "https://preview.example.com",
        siteUrl: "http://localhost:3000",
        vercelUrl: "other.vercel.app",
      }),
      "https://preview.example.com",
    );
    assert.equal(
      resolvePublicOrigin({
        siteUrl: "http://localhost:3000",
        vercelUrl: "10th-meridian-dxkrresz1-tesim-holdings.vercel.app",
      }),
      "https://10th-meridian-dxkrresz1-tesim-holdings.vercel.app",
    );
  });

  it("keeps localhost only when no public host exists", () => {
    assert.equal(
      resolvePublicOrigin({ siteUrl: "http://localhost:3000" }),
      "http://localhost:3000",
    );
    assert.equal(resolvePublicOrigin({}), "http://localhost:3000");
  });

  it("does not invent a production domain", () => {
    const origin = resolvePublicOrigin({
      siteUrl: "http://localhost:3000",
      vercelUrl: "10th-meridian-abc.vercel.app",
    });
    assert.equal(origin.includes("tenmeridian.com"), false);
    assert.equal(origin.includes("localhost"), false);
  });
});
