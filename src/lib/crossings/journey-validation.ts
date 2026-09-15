import { resolveJourneyTimezone } from "@/lib/geo/timezone";

export interface WhereDraft {
  destinationCity: string;
  destinationCountry: string;
  timezone: string;
}

export interface WhereValidation {
  ok: boolean;
  message?: string;
  timezone?: string;
  destinationCity: string;
  destinationCountry: string;
}

/** Validate Where before advancing to When. Keeps entered values. Never defaults Europe/Paris. */
export function validateWhereStep(draft: WhereDraft): WhereValidation {
  const destinationCity = draft.destinationCity.trim();
  const destinationCountry = draft.destinationCountry.trim();
  const timezone = draft.timezone.trim();

  if (!destinationCity || !destinationCountry) {
    return {
      ok: false,
      message: "City and country are required before choosing dates.",
      destinationCity: draft.destinationCity,
      destinationCountry: draft.destinationCountry,
    };
  }

  const tz = resolveJourneyTimezone({
    city: destinationCity,
    country: destinationCountry,
    timezone,
  });
  if (!tz.ok) {
    return {
      ok: false,
      message: tz.message,
      destinationCity: draft.destinationCity,
      destinationCountry: draft.destinationCountry,
    };
  }

  return {
    ok: true,
    timezone: tz.timezone,
    destinationCity,
    destinationCountry,
  };
}
