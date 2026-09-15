import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { stubInsert } from "@/lib/supabase/stub";
import {
  membershipFor,
  recordPaidMembership,
  revokePaidMembership,
  type MembershipProductKind,
  type PaidMembershipRecord,
} from "@/lib/preview/store";
import { linePriceId, type MembershipOffer } from "@/lib/stripe/catalog";
import { env } from "@/lib/env";

export type MembershipUnlockSource = "checkout" | "invoice" | "subscription";

export type MembershipUnlockInput = {
  eventId: string;
  source: MembershipUnlockSource;
  product: MembershipOffer;
  accountId?: string | null;
  email?: string | null;
  applicationId?: string | null;
  stripeCustomerId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripeInvoiceId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
};

export type UnlockResult = {
  ok: true;
  unlocked: boolean;
  already: boolean;
  stub: boolean;
  skipped?: string;
};

const processedEventIds = new Set<string>();

export function resetStripeEventLog() {
  processedEventIds.clear();
}

export function checkoutSessionShouldUnlock(session: Pick<
  Stripe.Checkout.Session,
  "mode" | "payment_status" | "status" | "metadata"
>): { ok: true; product: MembershipOffer } | { ok: false; reason: string } {
  const product = (session.metadata?.offer || session.metadata?.product) as MembershipOffer | undefined;
  if (product !== "founding" && product !== "standard") {
    return { ok: false, reason: "unknown-offer" };
  }
  if (product === "founding") {
    if (session.mode === "subscription") return { ok: false, reason: "founding-must-be-payment" };
    if (session.payment_status && session.payment_status !== "paid") {
      return { ok: false, reason: "not-paid" };
    }
    return { ok: true, product };
  }
  if (session.mode !== "subscription") return { ok: false, reason: "standard-must-be-subscription" };
  if (session.status === "expired") return { ok: false, reason: "expired" };
  if (session.payment_status && session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return { ok: false, reason: "not-paid" };
  }
  return { ok: true, product };
}

export function invoiceOfferFromLines(
  invoice: Stripe.Invoice,
): { product: MembershipOffer; priceId: string | null } | { reason: string } {
  const meta = (invoice.metadata?.offer || invoice.metadata?.product) as MembershipOffer | undefined;
  const lines = invoice.lines?.data ?? [];
  const priceIds = lines.map((line) => linePriceId(line)).filter((id): id is string => Boolean(id));
  if (priceIds.includes(env.stripeFoundingEntryPriceId)) {
    return { product: "founding", priceId: env.stripeFoundingEntryPriceId };
  }
  if (priceIds.includes(env.stripeStandardEntryPriceId) || priceIds.includes(env.stripeMonthlyPriceId)) {
    return { product: "standard", priceId: env.stripeStandardEntryPriceId || env.stripeMonthlyPriceId };
  }
  if (meta === "founding" || meta === "standard") {
    return { product: meta, priceId: priceIds[0] ?? null };
  }
  return { reason: "unrelated-invoice" };
}

export function subscriptionIsRevoked(status: string | null | undefined): boolean {
  return (
    status === "canceled" ||
    status === "unpaid" ||
    status === "incomplete_expired"
  );
}

export async function unlockMembership(input: MembershipUnlockInput): Promise<UnlockResult> {
  if (processedEventIds.has(input.eventId)) {
    return { ok: true, unlocked: false, already: true, stub: !getSupabaseAdmin() };
  }

  const preview = recordPaidMembership({
    accountId: input.accountId ?? "",
    email: input.email ?? undefined,
    applicationId: input.applicationId ?? undefined,
    product: input.product,
    status: "active",
    stripeCustomerId: input.stripeCustomerId ?? undefined,
    stripeCheckoutSessionId: input.stripeCheckoutSessionId ?? undefined,
    stripeInvoiceId: input.stripeInvoiceId ?? undefined,
    stripePaymentIntentId: input.stripePaymentIntentId ?? undefined,
    stripeSubscriptionId: input.stripeSubscriptionId ?? undefined,
    eventId: input.eventId,
    source: input.source,
  });

  stubInsert("membership_events", {
    kind: "stripe_unlock",
    type: input.source,
    event_id: input.eventId,
    session_id: input.stripeCheckoutSessionId ?? null,
    invoice_id: input.stripeInvoiceId ?? null,
    account_id: input.accountId ?? null,
    product: input.product,
    already: preview.already,
  });

  const admin = getSupabaseAdmin();
  if (!admin) {
    processedEventIds.add(input.eventId);
    return { ok: true, unlocked: !preview.already, already: preview.already, stub: true };
  }

  const claimed = await claimStripeEvent(admin, input.eventId, input.source, input.accountId, true);
  if (!claimed) {
    processedEventIds.add(input.eventId);
    return { ok: true, unlocked: false, already: true, stub: false };
  }

  const account = await resolveAccount(admin, input);
  if (!account) {
    processedEventIds.add(input.eventId);
    return { ok: true, unlocked: false, already: false, stub: false, skipped: "unmatched-account" };
  }

  await persistMembership(admin, account.id, input, "active");
  await promoteAccount(admin, account.id, account.role);
  await markApplicationActive(admin, account.id, input.applicationId);
  processedEventIds.add(input.eventId);
  return { ok: true, unlocked: true, already: false, stub: false };
}

export async function revokeMembership(input: {
  eventId: string;
  accountId?: string | null;
  email?: string | null;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
}): Promise<UnlockResult> {
  if (processedEventIds.has(input.eventId)) {
    return { ok: true, unlocked: false, already: true, stub: !getSupabaseAdmin() };
  }

  const preview = revokePaidMembership({
    accountId: input.accountId,
    email: input.email,
    stripeSubscriptionId: input.stripeSubscriptionId,
    eventId: input.eventId,
  });

  stubInsert("membership_events", {
    kind: "stripe_revoke",
    event_id: input.eventId,
    account_id: input.accountId ?? null,
    product: preview.record?.product ?? "standard",
  });

  const admin = getSupabaseAdmin();
  if (!admin) {
    processedEventIds.add(input.eventId);
    return { ok: true, unlocked: false, already: preview.already, stub: true };
  }

  await claimStripeEvent(admin, input.eventId, "subscription", input.accountId, false);

  let accountId = input.accountId ?? null;
  if (!accountId && input.stripeSubscriptionId) {
    const { data } = await admin
      .from("memberships")
      .select("account_id")
      .eq("stripe_subscription_id", input.stripeSubscriptionId)
      .maybeSingle();
    accountId = (data?.account_id as string | null) ?? null;
  }
  if (!accountId && input.email) {
    const account = await resolveAccount(admin, input);
    accountId = account?.id ?? null;
  }
  if (accountId) {
    await admin
      .from("memberships")
      .update({
        status: "canceled",
        cancel_at_period_end: false,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("account_id", accountId)
      .eq("product", "standard");
    await admin
      .from("accounts")
      .update({ role: "approved_unpaid", updated_at: new Date().toISOString() })
      .eq("id", accountId)
      .eq("role", "member");
  }
  processedEventIds.add(input.eventId);
  return { ok: true, unlocked: false, already: false, stub: false, skipped: "revoked" };
}

export function currentMembership(accountId?: string | null, email?: string | null): PaidMembershipRecord | null {
  return membershipFor(accountId, email);
}

type AdminClient = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

async function claimStripeEvent(
  admin: AdminClient,
  eventId: string,
  type: string,
  accountId: string | null | undefined,
  unlocked: boolean,
): Promise<boolean> {
  const { error } = await admin.from("stripe_events").insert({
    event_id: eventId,
    type,
    account_id: accountId ?? null,
    unlocked,
  });
  if (!error) return true;
  if (error.code === "23505") return false;
  return true;
}

async function resolveAccount(
  admin: AdminClient,
  input: { accountId?: string | null; email?: string | null },
): Promise<{ id: string; role: string | null } | null> {
  if (input.accountId) {
    const { data } = await admin.from("accounts").select("id, role").eq("id", input.accountId).maybeSingle();
    if (data?.id) return { id: data.id as string, role: (data.role as string | null) ?? null };
  }
  if (input.email) {
    const { data } = await admin.from("accounts").select("id, role").ilike("email", input.email).maybeSingle();
    if (data?.id) return { id: data.id as string, role: (data.role as string | null) ?? null };
  }
  return null;
}

async function persistMembership(
  admin: AdminClient,
  accountId: string,
  input: MembershipUnlockInput,
  status: "active" | "canceled",
) {
  const now = new Date().toISOString();
  const product: MembershipProductKind = input.product;
  const { data: existing } = await admin
    .from("memberships")
    .select("id")
    .eq("account_id", accountId)
    .eq("product", product)
    .maybeSingle();

  const patch = {
    product,
    status,
    stripe_customer_id: input.stripeCustomerId ?? null,
    stripe_price_id: input.stripePriceId ?? null,
    stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
    stripe_invoice_id: input.stripeInvoiceId ?? null,
    stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
    stripe_subscription_id: input.stripeSubscriptionId ?? null,
    paid_at: now,
    canceled_at: status === "canceled" ? now : null,
    source: input.source,
    updated_at: now,
  };

  if (existing?.id) {
    await admin.from("memberships").update(patch).eq("id", existing.id);
    return;
  }
  await admin.from("memberships").insert({ account_id: accountId, ...patch });
}

async function promoteAccount(admin: AdminClient, accountId: string, role: string | null) {
  if (role === "member" || role === "moderator" || role === "administrator") return;
  await admin.from("accounts").update({ role: "member", updated_at: new Date().toISOString() }).eq("id", accountId);
}

async function markApplicationActive(admin: AdminClient, accountId: string, applicationId?: string | null) {
  const now = new Date().toISOString();
  if (applicationId) {
    await admin.from("applications").update({ status: "active_member", updated_at: now }).eq("id", applicationId);
    return;
  }
  await admin
    .from("applications")
    .update({ status: "active_member", updated_at: now })
    .eq("account_id", accountId)
    .in("status", ["approved_payment_pending", "under_review", "submitted", "referred"]);
}

export function paymentIntentIdFrom(
  value: string | Stripe.PaymentIntent | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export function customerIdFrom(
  value: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export function subscriptionIdFrom(
  value: string | Stripe.Subscription | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}
