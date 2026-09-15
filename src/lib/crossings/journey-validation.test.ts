import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateWhereStep } from "@/lib/crossings/journey-validation";
import { inferTimezone, isValidTimeZone } from "@/lib/geo/timezone";
import { formatHumanDate, formatHumanDateRange } from "@/lib/crossings/format";

describe("journey Where validation", () => {
  it("does not advance with empty city or country and keeps entered values", () => {
    const empty = validateWhereStep({
      destinationCity: "",
      destinationCountry: "France",
      timezone: "",
    });
    assert.equal(empty.ok, false);
    assert.equal(empty.destinationCountry, "France");
    assert.match(empty.message ?? "", /City and country/);

    const cityOnly = validateWhereStep({
      destinationCity: "  Lisbon  ",
      destinationCountry: "   ",
      timezone: "Europe/Paris",
    });
    assert.equal(cityOnly.ok, false);
    assert.equal(cityOnly.destinationCity, "  Lisbon  ");
  });

  it("infers timezone from destination and never silently defaults Europe/Paris", () => {
    const chicago = validateWhereStep({
      destinationCity: "Chicago",
      destinationCountry: "United States",
      timezone: "",
    });
    assert.equal(chicago.ok, true);
    assert.equal(chicago.timezone, "America/Chicago");
    assert.equal(inferTimezone("Chicago", "United States"), "America/Chicago");
    assert.equal(inferTimezone("Unknownville", "Atlantis"), null);
    assert.equal(isValidTimeZone("Europe/Paris"), true);
    assert.equal(isValidTimeZone(""), false);
    assert.equal(isValidTimeZone("Not/AZone"), false);

    const unknown = validateWhereStep({
      destinationCity: "Unknownville",
      destinationCountry: "Atlantis",
      timezone: "",
    });
    assert.equal(unknown.ok, false);
    assert.match(unknown.message ?? "", /IANA timezone/);
    assert.equal(unknown.destinationCity, "Unknownville");
  });

  it("formats crossing dates for people", () => {
    assert.equal(formatHumanDate("2026-10-14"), "October 14, 2026");
    assert.equal(formatHumanDateRange("2026-10-14", "2026-10-15"), "October 14–15, 2026");
  });
});
