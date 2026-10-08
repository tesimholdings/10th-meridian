import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { demoProfiles } from "@/lib/data/demo";
import { seedAttendance } from "@/lib/events/attendance";
import { houseEvents, SESEH_MEDIA, SESEH_TRIP } from "@/lib/trips/seseh";

describe("Seseh villa week", () => {
  it("keeps the brochure facts and an empty room", () => {
    assert.equal(SESEH_TRIP.title, "Seseh, Bali: The Villa Week");
    assert.equal(SESEH_TRIP.priceLabel, "€9,000");
    assert.equal(SESEH_TRIP.capacity, 8);
    assert.equal(SESEH_TRIP.whenLabel, "October 26 – November 2, 2026");
    assert.equal(SESEH_TRIP.startsAt.startsWith("2026-10-26"), true);
    assert.equal(SESEH_TRIP.endsAt.startsWith("2026-11-02"), true);
    assert.equal(SESEH_TRIP.hostName, "Brian");
    assert.deepEqual(
      SESEH_TRIP.days.map((day) => day.title),
      [
        "Arrival",
        "Box and Snakes Day",
        "Boat Day",
        "Reset Day",
        "Uluwatu Day",
        "Unlock Day",
        "Beach Club Day",
        "Last day",
      ],
    );
    assert.match(SESEH_TRIP.days[1]?.items.join(" ") ?? "", /Snake hunting/);
    assert.match(SESEH_TRIP.days[4]?.optional ?? "", /Tabu, Giselle, Desa, Zumana/);
    assert.match(SESEH_TRIP.days[6]?.optional ?? "", /Savaya/);
    const blob = JSON.stringify(SESEH_TRIP);
    assert.equal(/fuck/i.test(blob), false);
    assert.equal(blob.includes("stripe"), false);
    assert.equal(houseEvents.length, 1);
    const event = houseEvents[0];
    assert.equal(event?.isDemo, false);
    assert.equal(event?.paymentRequired, false);
    assert.equal(event?.capacity, 8);
    assert.equal(event?.registered, 0);
    assert.equal(event?.waitlist, 0);
    assert.equal(event?.hostProfileId, undefined);
    assert.equal(
      demoProfiles.some((profile) => profile.attendingEventIds.includes(SESEH_TRIP.eventId)),
      false,
    );
    const regs = seedAttendance(
      demoProfiles,
      houseEvents.map((row) => ({ ...row })),
      new Map(demoProfiles.map((profile) => [profile.id, profile.attendingEventIds])),
    );
    assert.equal(
      regs.some((reg) => reg.eventId === SESEH_TRIP.eventId),
      false,
    );
  });

  it("ships scenery stills and an idempotent seed with no host account", () => {
    for (const src of Object.values(SESEH_MEDIA)) {
      assert.equal(existsSync(`public${src}`), true, src);
      assert.match(src, /\.webp$/);
    }
    const sql = readFileSync("supabase/migrations/0013_first_trip_seseh.sql", "utf8");
    assert.match(sql, /on conflict \(id\) do nothing/i);
    assert.match(sql, /host_account_id/);
    assert.match(sql, /€9,000/);
    assert.match(sql, /capacity,\s*\n\s*stripe_price_id/i);
    assert.match(sql, /\n  8,/);
    assert.match(sql, /false,\s*\n\s*null/i);
    assert.equal(/stripe_price_id,\s*\n\s*'price_/i.test(sql), false);
    assert.match(readFileSync("src/components/open-house/landing.tsx", "utf8"), /SESEH_TRIP\.path/);
    assert.match(readFileSync("src/app/experiences/seseh-bali/page.tsx", "utf8"), /Request a spot/);
    assert.match(readFileSync("src/app/experiences/seseh-bali/page.tsx", "utf8"), /\/apply/);
  });
});
