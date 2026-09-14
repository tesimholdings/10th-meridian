import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ context }) => {
  const auth = await context.request.post("/api/preview/session", {
    form: { role: "member" },
    maxRedirects: 0,
  });
  expect([303, 307]).toContain(auth.status());
  await context.request.post("/api/preview/session", {
    form: { openHouse: "open" },
    maxRedirects: 0,
  });
});

for (const [width, height] of [
  [390, 844],
  [430, 932],
  [768, 1024],
  [1440, 1000],
]) {
  test(`responsive pages and accessibility ${width}×${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    for (const route of [
      "/member/home",
      "/member/matches",
      "/member/members",
      "/member/channels",
      "/member/profile",
      "/member/events",
      "/member/resources",
      "/member/settings",
      "/member/billing",
      "/onboarding",
      "/apply",
      "/open-house",
    ]) {
      await page.goto(route);
      await expect(
        page.getByText("Opening the house.", { exact: true }),
      ).toHaveCount(0);
      if (route.startsWith("/member/"))
        await expect(page.locator("main > p.label")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      expect(overflow, `${route} overflows ${width}`).toBe(false);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations,
        `${route}: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
      ).toEqual([]);
    }
  });
}

test("application validates required fields and restores the draft", async ({
  page,
}) => {
  await page.goto("/apply");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
  await page.getByLabel("Name", { exact: true }).fill("Design Reviewer");
  await page.getByLabel("Email", { exact: true }).fill("reviewer@example.com");
  await page.reload();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    "Design Reviewer",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Role", { exact: true })).toBeVisible();
  await expect(page.locator(".form-step-title")).toBeFocused();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    "Design Reviewer",
  );
});

test("onboarding failure preserves answers and stays on the current step", async ({
  page,
}) => {
  await page.goto("/onboarding");
  await page
    .getByLabel("Headline", { exact: true })
    .fill("A preserved headline");
  await page.route("**/api/profile", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"ok":false}',
    }),
  );
  await page.getByRole("button", { name: "Save & continue" }).click();
  await expect(page.getByRole("status")).toContainText("couldn’t be saved");
  await expect(page.getByLabel("Headline", { exact: true })).toHaveValue(
    "A preserved headline",
  );
  await expect(
    page.getByRole("button", { name: "Save & continue" }),
  ).toBeEnabled();
});

test("channel drafts, dialog focus, and failed-send recovery", async ({
  page,
}) => {
  await page.goto("/member/channels");
  const message = page.getByRole("textbox", { name: "Message", exact: true });
  await message.fill("Keep this message\nAnd this second line");
  await page.getByRole("button", { name: "All channels" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "All channels" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "All channels" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "#ideas" })
    .click();
  await expect(message).toHaveValue("");
  await page.getByRole("button", { name: "All channels" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "#introductions" })
    .click();
  await expect(message).toHaveValue("Keep this message\nAnd this second line");
  await page.route("**/api/channels", (route) => route.abort());
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".channel-app [role=alert]")).toContainText(
    "Your draft is safe",
  );
  await expect(message).toHaveValue("Keep this message\nAnd this second line");
  await expect(
    page.getByRole("button", { name: "Send message", exact: true }),
  ).toBeEnabled();
});

test("empty directory offers a working reset", async ({ page }) => {
  await page.goto("/member/members");
  await page
    .getByRole("textbox", { name: "Search members" })
    .fill("zzzz-no-such-person");
  await expect(page.getByText("A little more room to explore.")).toBeVisible();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(
    page.getByRole("link", { name: "Open profile" }).first(),
  ).toBeVisible();
});

test("motion can be paused and system reduced motion is respected", async ({
  page,
  context,
}) => {
  await context.clearCookies();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Pause animations", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  expect(
    await page
      .locator(".hero-image")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.getByRole("button", { name: "Resume animations" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "Reduced motion enabled" }),
  ).toBeDisabled();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
});

test("application error keeps the final step and can retry to confirmation", async ({
  page,
}) => {
  await page.goto("/apply");
  await page.getByLabel("Name", { exact: true }).fill("Design Reviewer");
  await page.getByLabel("Email", { exact: true }).fill("reviewer@example.com");
  for (let step = 0; step < 4; step++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.route("**/api/applications", (r) => r.abort());
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByRole("status")).toContainText(
    "answers are still here",
  );
  await page.unroute("**/api/applications");
  await page.route("**/api/applications", (r) =>
    r.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, message: "DEMO application received." }),
    }),
  );
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(
    page.getByRole("heading", { name: "Now, in human hands." }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => sessionStorage.getItem("tm-application")),
  ).toBeNull();
});

test("successful message send clears only its own draft and renders the message", async ({
  page,
}) => {
  await page.goto("/member/channels");
  const draft = page.getByRole("textbox", { name: "Message", exact: true });
  const message = `Review conversation ${Date.now()}`;
  await draft.fill(message);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(draft).toHaveValue("");
  await expect(
    page.locator(".channel-message").filter({ hasText: message }),
  ).toBeVisible();
});

test("public entrance, profile detail and event detail remain accessible on a phone", async ({
  page,
  context,
}) => {
  await page.goto("/member/members");
  await page.getByRole("link", { name: "Open profile" }).first().click();
  await expect(page.locator(".profile-details")).toBeVisible();
  for (const width of [390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 932 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  await page.goto("/member/events");
  await page.locator("a.experience-feature").click();
  await expect(
    page.getByRole("button", { name: "Register or join waitlist" }),
  ).toBeVisible();
  await context.clearCookies();
  for (const route of [
    "/",
    "/sign-in?error=1",
    "/referral",
    "/remind",
    "/legal/privacy",
    "/legal/terms",
    "/legal/community",
  ]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      route,
    ).toBe(false);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
      route,
    ).toEqual([]);
  }
});

test("steward surfaces remain readable and usable", async ({
  page,
  context,
}) => {
  await context.request.post("/api/preview/session", {
    form: { role: "administrator" },
    maxRedirects: 0,
  });
  for (const route of [
    "/admin",
    "/admin/admissions",
    "/admin/matching",
    "/admin/referrals",
    "/admin/events",
    "/admin/billing",
    "/admin/open-house",
  ]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      route,
    ).toBe(false);
  }
});
