import { chromium } from "@playwright/test";
import { rename } from "node:fs/promises";
const base = process.env.REVIEW_URL || "http://localhost:3100";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 430, height: 932 },
  reducedMotion: "no-preference",
  recordVideo: { dir: "docs/design/motion", size: { width: 430, height: 932 } },
});
const page = await context.newPage();
const visit = async (route) => {
  await page.goto(base + route);
  await page.addStyleTag({
    content: "nextjs-portal, details.fixed {display:none !important}",
  });
  await page.evaluate(() => document.fonts.ready);
};
await visit("/");
await page.waitForTimeout(1800);
await page.evaluate(() => window.scrollTo({ top: 360, behavior: "smooth" }));
await page.waitForTimeout(1000);
await context.request.post(base + "/api/preview/session", {
  form: { role: "member" },
});
await visit("/member/crossings");
await page.locator(".crossings-hero").waitFor();
await page.waitForTimeout(1200);
await page.evaluate(() => window.scrollTo({ top: 650, behavior: "smooth" }));
await page.waitForTimeout(1100);
await visit("/member/crossings/jny-demo-01");
await page.locator(".travel-match").first().scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.locator(".travel-match").first().click();
await page.getByRole("dialog").waitFor();
await page.waitForTimeout(1500);
await page.getByRole("dialog").getByLabel("Proposed date 1").fill("2026-10-14");
await page.waitForTimeout(700);
await page.keyboard.press("Escape");
await page.waitForTimeout(600);
await context.close();
const path = await page.video().path();
await rename(path, "docs/design/motion-preview.webm");
await browser.close();
console.log("Saved docs/design/motion-preview.webm");
