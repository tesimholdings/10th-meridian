import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const phase = process.argv[2] || "after";
const base = process.env.REVIEW_URL || "http://localhost:3100";
const browser = await chromium.launch();
for (const [name, width, height] of [
  ["mobile", 390, 844],
  ["large-mobile", 430, 932],
  ["tablet", 768, 1024],
  ["desktop", 1440, 1000],
]) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await mkdir(`docs/design/${phase}`, { recursive: true });
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  const clean = async () =>
    page.addStyleTag({
      content:
        "nextjs-portal { display:none !important } details.fixed { display:none !important }",
    });
  await clean();
  await page.screenshot({
    path: `docs/design/${phase}/lock-${name}.png`,
    fullPage: true,
  });
  const auth = await context.request.post(`${base}/api/preview/session`, {
    form: { role: "member" },
    maxRedirects: 0,
  });
  if (![303, 307].includes(auth.status()))
    throw new Error(`Preview auth failed: ${auth.status()}`);
  await context.request.post(`${base}/api/preview/session`, {
    form: { openHouse: "open" },
  });
  for (const [label, route] of [
    ["home", "/member/home"],
    ["index", "/member/matches"],
    ["channels", "/member/channels"],
    ["onboarding", "/onboarding"],
    ["apply", "/apply"],
    ["members", "/member/members"],
    ["open-house", "/open-house"],
  ]) {
    await page.goto(base + route);
    await page.evaluate(() => document.fonts.ready);
    if (route.startsWith("/member/"))
      await page.locator("main > p.label").waitFor();
    await page
      .getByText("Opening the house.", { exact: true })
      .waitFor({ state: "hidden" });
    if (!page.url().endsWith(route))
      throw new Error(`Unexpected redirect: ${route} -> ${page.url()}`);
    await page.addStyleTag({
      content:
        "nextjs-portal {display:none !important} details.fixed {display:none !important}",
    });
    await page.screenshot({
      path: `docs/design/${phase}/${label}-${name}.png`,
      fullPage: label === "apply" || label === "onboarding",
    });
  }
  await context.close();
  console.log(`${phase}: ${name} complete`);
}
await browser.close();
