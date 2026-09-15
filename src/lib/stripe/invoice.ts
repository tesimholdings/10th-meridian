import { env, canChargeMembership, hasStripe } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import {
  checkoutMetadata,
  isApprovedFoundingPrice,
  isApprovedStandardEntryPrice,
  isArchivedLifetimePrice,
  type MembershipOffer,
} from "@/lib/stripe/catalog";
import { resolveMembershipOffer } from "@/lib/stripe/seats";

export type EntryInvoiceInput = {
  email: string;
  accountId?: string;
  applicationId?: string;
  daysUntilDue?: number;
  offer?: MembershipOffer;
};

export type EntryInvoiceReason =
  | "missing-keys"
  | "missing-price"
  | "missing-email"
  | "livemode-blocked"
  | "price-unverified"
  | "price-mismatch"
  | "price-inactive"
  | "archived-lifetime"
  | "no-hosted-url";

export type EntryInvoiceResult =
  | {
      ok: true;
      stub: false;
      invoiceId: string;
      hostedInvoiceUrl: string;
      customerId: string;
      offer: MembershipOffer;
    }
  | { ok: false; stub: true; reason: EntryInvoiceReason };

/**
 * Hosted invoice for the entry Price only (Dashboard alternative).
 * Founding: $5,000. Standard: $10,000 (monthly dues still require Checkout or a subscription).
 */
export async function createEntryInvoice(input: EntryInvoiceInput): Promise<EntryInvoiceResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, stub: true, reason: "missing-email" };
  }
  if (!hasStripe()) return { ok: false, stub: true, reason: "missing-keys" };
  if (!canChargeMembership()) {
    const key = env.stripeSecretKey;
    const liveBlocked =
      (key.startsWith("sk_live") || key.startsWith("rk_live")) &&
      !(env.isProduction && env.runtimeMode === "live");
    return { ok: false, stub: true, reason: liveBlocked ? "livemode-blocked" : "missing-price" };
  }

  const resolved = input.offer
    ? { offer: input.offer }
    : await resolveMembershipOffer({ accountId: input.accountId, email });
  const offer = resolved.offer;
  const priceId = offer === "founding" ? env.stripeFoundingEntryPriceId : env.stripeStandardEntryPriceId;
  if (!priceId) return { ok: false, stub: true, reason: "missing-price" };
  if (isArchivedLifetimePrice(priceId)) return { ok: false, stub: true, reason: "archived-lifetime" };

  const stripe = getStripe();
  if (!stripe) return { ok: false, stub: true, reason: "missing-keys" };

  try {
    const price = await stripe.prices.retrieve(priceId);
    const check = offer === "founding" ? isApprovedFoundingPrice(price) : isApprovedStandardEntryPrice(price);
    if (!check.ok) return { ok: false, stub: true, reason: check.reason };
  } catch {
    return { ok: false, stub: true, reason: "price-unverified" };
  }

  const metadata = checkoutMetadata({
    accountId: input.accountId ?? "",
    offer,
    applicationId: input.applicationId,
  });

  const existing = await stripe.customers.list({ email, limit: 1 });
  const customer =
    existing.data[0] ??
    (await stripe.customers.create({ email, metadata }));

  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: input.daysUntilDue ?? 14,
    metadata,
    pending_invoice_items_behavior: "exclude",
  });

  await stripe.invoiceItems.create({
    customer: customer.id,
    invoice: invoice.id,
    pricing: { price: priceId },
    quantity: 1,
    metadata,
  });

  await stripe.invoices.finalizeInvoice(invoice.id);
  const sent = await stripe.invoices.sendInvoice(invoice.id);
  if (!sent.hosted_invoice_url) return { ok: false, stub: true, reason: "no-hosted-url" };
  return {
    ok: true,
    stub: false,
    invoiceId: sent.id,
    hostedInvoiceUrl: sent.hosted_invoice_url,
    customerId: customer.id,
    offer,
  };
}

/** @deprecated Use createEntryInvoice. */
export const createLifetimeInvoice = createEntryInvoice;

export function invoiceStubMessage(reason: EntryInvoiceReason) {
  switch (reason) {
    case "missing-email":
      return "A member email is required to create a hosted invoice.";
    case "archived-lifetime":
      return "The archived lifetime Price is not used.";
    default:
      return "Invoice helper is stubbed until TEST keys and entry Price IDs are set. Nothing was charged.";
  }
}
