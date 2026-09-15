import type { MatchExplanation, ProfileRecord } from "@/lib/data/types";

/** One short truthful Index reason. City is always explicit. Never filler. */
export function shortMatchReason(
  target: ProfileRecord,
  explanations: MatchExplanation[] = [],
): string {
  const city = target.city;
  const offer = target.offers[0];
  const first = explanations[0];

  if (first?.pillar === "Geography" || first?.pillar === "Travel") {
    return `${plain(first.text)} · ${city}`;
  }
  if (first?.pillar === "Reciprocal value" && offer) {
    return `${plainOffer(offer)} · ${city}`;
  }
  if (first?.text) {
    return `${plain(first.text)} · ${city}`;
  }
  if (offer) return `${plainOffer(offer)} · ${city}`;
  return city;
}

function plain(text: string): string {
  return text
    .replace(/^[A-Za-z .]+:\s*/, "")
    .replace(/\.$/, "")
    .replace(/^A quiet compatibility — /, "")
    .slice(0, 72);
}

function plainOffer(offer: string): string {
  return offer.charAt(0).toUpperCase() + offer.slice(1);
}
