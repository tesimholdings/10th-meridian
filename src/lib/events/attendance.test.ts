import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyPromotion,
  canPromoteAttendance,
  journeyCompanions,
  rosterForEvent,
  seedAttendance,
} from "@/lib/events/attendance";

const profiles = [
  { id: "demo-01", accountId: "demo-acc-01", displayName: "A. Voss", initials: "AV", accent: "#111" },
  { id: "demo-02", accountId: "demo-acc-02", displayName: "M. Okonkwo", initials: "MO", accent: "#222" },
  { id: "demo-03", accountId: "demo-acc-03", displayName: "S. Ellison", initials: "SE", accent: "#333" },
  { id: "demo-10", accountId: "demo-acc-10", displayName: "T. Quinn", initials: "TQ", accent: "#444" },
  { id: "demo-11", accountId: "demo-acc-11", displayName: "H. Sato", initials: "HS", accent: "#555" },
];

describe("event attendance", () => {
  it("lists only existing members, with waitlist position", () => {
    const roster = rosterForEvent(
      "evt-demo-2",
      profiles,
      [
        { eventId: "evt-demo-2", accountId: "demo-acc-01", status: "registered" },
        { eventId: "evt-demo-2", accountId: "missing-person", status: "registered" },
        { eventId: "evt-demo-2", accountId: "demo-acc-02", status: "waitlist" },
        { eventId: "evt-demo-2", accountId: "demo-acc-10", status: "waitlist" },
        { eventId: "evt-other", accountId: "demo-acc-03", status: "registered" },
      ],
    );
    assert.deepEqual(
      roster.going.map((face) => face.name),
      ["A. Voss"],
    );
    assert.deepEqual(
      roster.waitlist.map((face) => [face.name, face.position]),
      [
        ["M. Okonkwo", 1],
        ["T. Quinn", 2],
      ],
    );
  });

  it("promotes a waitlisted member into attending and renumbers the line", () => {
    const before = [
      { eventId: "evt-demo-2", accountId: "demo-acc-01", status: "registered" as const },
      { eventId: "evt-demo-2", accountId: "demo-acc-02", status: "waitlist" as const },
      { eventId: "evt-demo-2", accountId: "demo-acc-10", status: "waitlist" as const },
    ];
    const promoted = applyPromotion(before, "evt-demo-2", "demo-acc-02");
    assert.equal(promoted.ok, true);
    if (!promoted.ok) return;
    const roster = rosterForEvent("evt-demo-2", profiles, promoted.regs);
    assert.deepEqual(
      roster.going.map((face) => face.name),
      ["A. Voss", "M. Okonkwo"],
    );
    assert.deepEqual(roster.waitlist.map((face) => [face.name, face.position]), [["T. Quinn", 1]]);
    const again = applyPromotion(promoted.regs, "evt-demo-2", "demo-acc-02");
    assert.equal(again.ok, false);
  });

  it("lets the host, a steward, or an administrator promote", () => {
    assert.equal(canPromoteAttendance({ role: "member", viewerId: "demo-01", hostProfileId: "demo-09" }), false);
    assert.equal(canPromoteAttendance({ role: "member", viewerId: "demo-01", hostProfileId: "demo-01" }), true);
    assert.equal(canPromoteAttendance({ role: "moderator", viewerId: "other", hostProfileId: null }), true);
    assert.equal(canPromoteAttendance({ role: "administrator", viewerId: "other" }), true);
  });

  it("seeds the salon waitlist from members who are not already attending", () => {
    const events = [
      { id: "evt-demo-1", registered: 0, waitlist: 0 },
      { id: "evt-demo-2", registered: 0, waitlist: 0 },
    ];
    const attending = new Map<string, readonly string[]>([
      ["demo-01", ["evt-demo-1", "evt-demo-2"]],
      ["demo-03", ["evt-demo-2"]],
    ]);
    const regs = seedAttendance(profiles, events, attending);
    const salon = rosterForEvent("evt-demo-2", profiles, regs);
    assert.deepEqual(
      salon.going.map((face) => face.name),
      ["A. Voss", "S. Ellison"],
    );
    assert.deepEqual(
      salon.waitlist.map((face) => face.name),
      ["M. Okonkwo", "T. Quinn", "H. Sato"],
    );
    assert.equal(events[1]?.registered, 2);
    assert.equal(events[1]?.waitlist, 3);
    assert.equal(regs.some((reg) => reg.accountId === "invented"), false);
  });

  it("shows travelers already going to the same city", () => {
    const faces = journeyCompanions(
      "Paris",
      [
        { profileId: "demo-01", destinationCity: "Paris", status: "active" },
        { profileId: "demo-02", destinationCity: "Paris", status: "active" },
        { profileId: "demo-02", destinationCity: "Paris", status: "active" },
        { profileId: "demo-10", destinationCity: "Paris", status: "deleted" },
        { profileId: "ghost", destinationCity: "Paris", status: "active" },
      ],
      profiles,
    );
    assert.deepEqual(
      faces.map((face) => face.name),
      ["A. Voss", "M. Okonkwo"],
    );
  });
});
