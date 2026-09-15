export const STRIPE_TEST_ACCOUNT_ID = "acct_1UG1Kk3QQyESIKbf";

/** Archived lifetime-only catalog — never charge these. */
export const ARCHIVED_LIFETIME_PRODUCT_ID = "prod_VGYfTJu8zQwQsu";
export const ARCHIVED_LIFETIME_PRICE_ID = "price_1UG1Xg3QQyESIKbfV5BfJF6U";

export const STRIPE_TEST_FOUNDING_PRODUCT_ID = "prod_VGYljGUfFRXAJL";
export const STRIPE_TEST_FOUNDING_PRICE_ID = "price_1UG1eB3QQyESIKbfGysIcPYf";

export const STRIPE_TEST_STANDARD_ENTRY_PRODUCT_ID = "prod_VGYlccULz3Tlvk";
export const STRIPE_TEST_STANDARD_ENTRY_PRICE_ID = "price_1UG1eC3QQyESIKbfKbIfpHct";

export const STRIPE_TEST_MONTHLY_PRODUCT_ID = "prod_VGYldDAu1NeaUT";
export const STRIPE_TEST_MONTHLY_PRICE_ID = "price_1UG1eD3QQyESIKbfZJOuoyS6";

export const FOUNDING_TEN_CAP = 10;
export const FOUNDING_ENTRY_CENTS = 500_000;
export const STANDARD_ENTRY_CENTS = 1_000_000;
export const MONTHLY_DUES_CENTS = 19_500;
export const PRICE_CURRENCY = "usd";

export type MembershipOffer = "founding" | "standard";

export type PriceSnapshot = {
  id?: string | null;
  type?: string | null;
  recurring?: { interval?: string | null } | null;
  unit_amount?: number | null;
  currency?: string | null;
  active?: boolean | null;
};

export type PriceCheck =
  | { ok: true }
  | { ok: false; reason: "missing-price" | "price-inactive" | "price-mismatch" | "archived-lifetime" };

export function isArchivedLifetimePrice(priceId: string | null | undefined): boolean {
  return priceId === ARCHIVED_LIFETIME_PRICE_ID;
}

export function isApprovedFoundingPrice(price: PriceSnapshot | null | undefined): PriceCheck {
  return checkOneTime(price, FOUNDING_ENTRY_CENTS);
}

export function isApprovedStandardEntryPrice(price: PriceSnapshot | null | undefined): PriceCheck {
  return checkOneTime(price, STANDARD_ENTRY_CENTS);
}

export function isApprovedMonthlyPrice(price: PriceSnapshot | null | undefined): PriceCheck {
  if (!price?.id) return { ok: false, reason: "missing-price" };
  if (isArchivedLifetimePrice(price.id)) return { ok: false, reason: "archived-lifetime" };
  if (price.active === false) return { ok: false, reason: "price-inactive" };
  if (price.type && price.type !== "recurring") return { ok: false, reason: "price-mismatch" };
  if (!price.recurring || price.recurring.interval !== "month") {
    return { ok: false, reason: "price-mismatch" };
  }
  if (price.currency && price.currency.toLowerCase() !== PRICE_CURRENCY) {
    return { ok: false, reason: "price-mismatch" };
  }
  if (price.unit_amount != null && price.unit_amount !== MONTHLY_DUES_CENTS) {
    return { ok: false, reason: "price-mismatch" };
  }
  return { ok: true };
}

function checkOneTime(price: PriceSnapshot | null | undefined, cents: number): PriceCheck {
  if (!price?.id) return { ok: false, reason: "missing-price" };
  if (isArchivedLifetimePrice(price.id)) return { ok: false, reason: "archived-lifetime" };
  if (price.active === false) return { ok: false, reason: "price-inactive" };
  if (price.recurring) return { ok: false, reason: "price-mismatch" };
  if (price.type && price.type !== "one_time") return { ok: false, reason: "price-mismatch" };
  if (price.currency && price.currency.toLowerCase() !== PRICE_CURRENCY) {
    return { ok: false, reason: "price-mismatch" };
  }
  if (price.unit_amount != null && price.unit_amount !== cents) {
    return { ok: false, reason: "price-mismatch" };
  }
  return { ok: true };
}

export function isLiveStripeKey(key: string): boolean {
  const value = key.trim();
  return value.startsWith("sk_live") || value.startsWith("rk_live");
}

export function linePriceId(line: {
  pricing?: { price_details?: { price?: string | { id?: string } | null } | null } | null;
  price?: string | { id?: string } | null;
}): string | null {
  const details = line.pricing?.price_details?.price;
  if (typeof details === "string" && details) return details;
  if (details && typeof details === "object" && details.id) return details.id;
  if (typeof line.price === "string" && line.price) return line.price;
  if (line.price && typeof line.price === "object" && line.price.id) return line.price.id;
  return null;
}

export function checkoutMetadata(input: {
  accountId: string;
  offer: MembershipOffer;
  applicationId?: string;
}): Record<string, string> {
  const metadata: Record<string, string> = {
    accountId: input.accountId,
    offer: input.offer,
    product: input.offer,
  };
  if (input.applicationId) metadata.applicationId = input.applicationId;
  return metadata;
}
