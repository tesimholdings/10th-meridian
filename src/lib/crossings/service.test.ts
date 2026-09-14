import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoProfiles } from "@/lib/data/demo";
import { demoJourneys } from "@/lib/data/crossings-demo";
import { crossingIcs } from "@/lib/crossings/ics";
import {
  canMutateCrossings,
  canViewerSeeJourney,
  findForbiddenTravelDetail,
  venueVisibleTo,
} from "@/lib/crossings/privacy";
import {
  createJourney,
  deleteJourney,
  emptyCrossingsState,
  icsForRequest,
  joinTable,
  openTable,
  pauseJourney,
  proposeCrossing,
  publicTableView,
  respondToCrossing,
  updateJourney,
  visibleCityNotes,
  visibleJourneysFor,
} from "@/lib/crossings/service";
import type { JourneyRecord } from "@/lib/crossings/types";

const viewer = demoProfiles[0];

function baseJourney(): Omit<JourneyRecord, "id" | "status" | "createdAt" | "updatedAt" | "isDemo"> {
  return {
    profileId: viewer.id,
    destinationCity: "Lisbon",
    destinationCountry: "Portugal",
    arrivalDate: "2026-12-01",
    departureDate: "2026-12-06",
    timezone: "Europe/Lisbon",
    flexibleDates: false,
    availability: ["coffee"],
    intents: ["friendship"],
    visibility: "all_members",
    openToOneToOne: true,
    openToGroupTable: false,
    needsLocalRecommendation: false,
    willingCityHost: false,
    selectedChannelIds: [],
  };
}

describe("Crossings service, privacy, and requests", () => {
  it("creates, edits, pauses, and deletes a journey", () => {
    const state = emptyCrossingsState();
    const created = createJourney(state, baseJourney());
    assert.equal(created.status, "active");
    updateJourney(state, created.id, viewer.id, { privateNote: "A short private note." });
    pauseJourney(state, created.id, viewer.id);
    assert.equal(state.journeys[0].status, "paused");
    deleteJourney(state, created.id, viewer.id);
    assert.equal(state.journeys[0].status, "deleted");
  });

  it("rejects flight numbers and room details on journeys", () => {
    const state = emptyCrossingsState();
    assert.throws(
      () => createJourney(state, { ...baseJourney(), privateNote: "Flight AA123 at noon" }),
      /Flight/,
    );
    assert.ok(findForbiddenTravelDetail("Room 412 at the hotel"));
  });

  it("Crossing request accept opens a conversation; decline does not", () => {
    const state = emptyCrossingsState();
    const journey = createJourney(state, baseJourney());
    const req = proposeCrossing(state, {
      fromProfileId: viewer.id,
      toProfileId: "demo-09",
      journeyId: journey.id,
      format: "coffee",
      proposedDates: ["2026-12-02"],
    });
    const declined = respondToCrossing(state, {
      requestId: req.id,
      actorId: "demo-09",
      action: "decline",
    });
    assert.equal(declined.status, "declined");
    assert.equal(declined.conversationId, undefined);

    const req2 = proposeCrossing(state, {
      fromProfileId: viewer.id,
      toProfileId: "demo-12",
      journeyId: journey.id,
      format: "walk",
      proposedDates: ["2026-12-03"],
    });
    const accepted = respondToCrossing(state, {
      requestId: req2.id,
      actorId: "demo-12",
      action: "accept",
    });
    assert.equal(accepted.status, "accepted");
    assert.ok(accepted.conversationId);
    assert.equal(state.conversations.length, 1);
  });

  it("reschedule stores suggested times without opening a channel", () => {
    const state = emptyCrossingsState();
    const journey = createJourney(state, baseJourney());
    const req = proposeCrossing(state, {
      fromProfileId: viewer.id,
      toProfileId: "demo-03",
      journeyId: journey.id,
      format: "lunch",
      proposedDates: ["2026-12-02"],
    });
    const next = respondToCrossing(state, {
      requestId: req.id,
      actorId: "demo-03",
      action: "reschedule",
      suggestedDates: ["2026-12-04"],
    });
    assert.equal(next.status, "reschedule_suggested");
    assert.deepEqual(next.suggestedDates, ["2026-12-04"]);
    assert.equal(state.conversations.length, 0);
  });

  it("blocks prevent Crossing requests", () => {
    const state = emptyCrossingsState();
    state.blocks.push({ a: viewer.id, b: "demo-04" });
    const journey = createJourney(state, baseJourney());
    assert.throws(
      () =>
        proposeCrossing(state, {
          fromProfileId: viewer.id,
          toProfileId: "demo-04",
          journeyId: journey.id,
          format: "coffee",
          proposedDates: ["2026-12-02"],
        }),
      /not available/,
    );
  });

  it("group tables enforce capacity and hide venue from non-confirmed guests", () => {
    const state = emptyCrossingsState();
    const table = openTable(state, {
      city: "Paris",
      country: "France",
      neighborhood: "6th",
      venuePrivate: "Exact courtyard — confirmed only",
      dateTime: "2026-10-14T19:00:00.000Z",
      timezone: "Europe/Paris",
      mealType: "dinner",
      maxGuests: 3,
      joinMode: "request",
      openedByProfileId: viewer.id,
      guests: [{ profileId: "demo-09", status: "confirmed" }],
    });
    assert.ok(table.channelId);
    joinTable(state, table.id, "demo-02");
    joinTable(state, table.id, "demo-05");
    const full = openTable(state, {
      city: "Paris",
      country: "France",
      neighborhood: "Marais",
      dateTime: "2026-10-15T19:00:00.000Z",
      timezone: "Europe/Paris",
      mealType: "dinner",
      maxGuests: 3,
      joinMode: "request",
      openedByProfileId: viewer.id,
      guests: [
        { profileId: "demo-09", status: "confirmed" },
        { profileId: "demo-02", status: "confirmed" },
      ],
    });
    assert.throws(() => joinTable(state, full.id, "demo-08"), /full/);
    const hidden = publicTableView(table, "demo-05", "member");
    assert.equal(hidden.venuePrivate, undefined);
    const shown = publicTableView(table, "demo-09", "member");
    assert.equal(shown.venuePrivate, "Exact courtyard — confirmed only");
    assert.equal(
      venueVisibleTo({
        tableOpenedBy: viewer.id,
        confirmedIds: ["demo-09"],
        viewerId: "stranger",
        viewerRole: "member",
      }),
      false,
    );
  });

  it("expired journeys are hidden from other members but remain on the owner's history", () => {
    const state = emptyCrossingsState();
    const created = createJourney(state, {
      ...baseJourney(),
      arrivalDate: "2026-08-01",
      departureDate: "2026-08-04",
    });
    created.status = "expired";
    const others = visibleJourneysFor({
      state,
      viewerId: "demo-09",
      viewerRole: "member",
      meridianMatchIds: [],
      sharedChannelIds: [],
    });
    assert.equal(others.find((j) => j.id === created.id), undefined);
    const mine = visibleJourneysFor({
      state,
      viewerId: viewer.id,
      viewerRole: "member",
      meridianMatchIds: [],
      sharedChannelIds: [],
    });
    assert.ok(mine.find((j) => j.id === created.id));
  });

  it("meridian_matches visibility hides journeys from non-matches", () => {
    const state = emptyCrossingsState();
    const created = createJourney(state, { ...baseJourney(), visibility: "meridian_matches" });
    const hidden = visibleJourneysFor({
      state,
      viewerId: "demo-11",
      viewerRole: "member",
      meridianMatchIds: [],
      sharedChannelIds: [],
    });
    const shown = visibleJourneysFor({
      state,
      viewerId: "demo-11",
      viewerRole: "member",
      meridianMatchIds: [viewer.id],
      sharedChannelIds: [],
    });
    assert.equal(hidden.find((j) => j.id === created.id), undefined);
    assert.ok(shown.find((j) => j.id === created.id));
  });

  it("Open House guests cannot mutate Crossings", () => {
    assert.equal(canMutateCrossings("guest"), false);
    assert.equal(canMutateCrossings("approved_unpaid"), false);
    assert.equal(canMutateCrossings("member"), true);
  });

  it("paused journeys are not visible to other members", () => {
    const journey = demoJourneys.find((j) => j.id === "jny-demo-paused")!;
    assert.equal(
      canViewerSeeJourney({
        journey,
        viewerId: "demo-02",
        viewerRole: "member",
        isMeridianMatch: true,
        sharedChannelIds: [],
      }),
      false,
    );
  });

  it("writes an .ics file only after acceptance", () => {
    const state = emptyCrossingsState();
    const journey = createJourney(state, baseJourney());
    const req = proposeCrossing(state, {
      fromProfileId: viewer.id,
      toProfileId: "demo-09",
      journeyId: journey.id,
      format: "coffee",
      proposedDates: ["2026-12-02"],
    });
    assert.throws(() => icsForRequest(state, req.id, demoProfiles), /after acceptance/);
    respondToCrossing(state, { requestId: req.id, actorId: "demo-09", action: "accept" });
    const ics = icsForRequest(state, req.id, demoProfiles);
    assert.match(ics, /BEGIN:VCALENDAR/);
    assert.match(ics, /A Crossing in Lisbon/);
    assert.match(ics, /city-level/i);
    const fromIcs = crossingIcs({
      request: state.requests[0],
      journey,
      fromName: "A. Voss",
      toName: "C. Moreau",
    });
    assert.match(fromIcs, /LOCATION:Lisbon/);
    assert.match(fromIcs, /Portugal/);
  });

  it("Open House isolation: City Notes never expose non-demo rows to guests", () => {
    const state = emptyCrossingsState();
    state.notes.push({
      id: "note-real",
      authorProfileId: "demo-01",
      city: "Paris",
      country: "France",
      kind: "restaurant",
      title: "Should never appear at Open House",
      body: "Real member data.",
      savedBy: [],
      reportedBy: [],
      moderation: "visible",
      isDemo: false,
      createdAt: new Date().toISOString(),
    });
    state.notes.push({
      id: "note-demo",
      authorProfileId: "demo-09",
      city: "Paris",
      country: "France",
      kind: "bar",
      title: "DEMO courtyard",
      body: "SYNTHETIC DEMO",
      savedBy: [],
      reportedBy: [],
      moderation: "visible",
      isDemo: true,
      createdAt: new Date().toISOString(),
    });
    const guest = visibleCityNotes(state, false);
    assert.equal(guest.some((n) => n.id === "note-real"), false);
    assert.equal(guest.some((n) => n.id === "note-demo"), true);
    const member = visibleCityNotes(state, true);
    assert.equal(member.some((n) => n.id === "note-real"), true);
  });

  it("invitation-only tables reject unsolicited joins", () => {
    const state = emptyCrossingsState();
    const table = openTable(state, {
      city: "Paris",
      country: "France",
      neighborhood: "4th",
      dateTime: "2026-10-14T12:00:00.000Z",
      timezone: "Europe/Paris",
      mealType: "lunch",
      maxGuests: 4,
      joinMode: "invitation",
      openedByProfileId: viewer.id,
    });
    assert.throws(() => joinTable(state, table.id, "demo-08"), /invitation-only/);
  });
});
