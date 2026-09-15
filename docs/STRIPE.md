# Stripe (review only)

Tenth Meridian billing on TEST account `acct_1UG1Kk3QQyESIKbf`. Do not enable livemode from this PR. Do not purchase anything.

## Offers

| Offer | When | Checkout | Prices (TEST) |
| --- | --- | --- | --- |
| **Founding Ten** | First 10 members | `mode=payment` | `price_1UG1eB3QQyESIKbfGysIcPYf` · $5,000 one_time · `prod_VGYljGUfFRXAJL` |
| **Standard** | After Founding Ten, and every rejoin | `mode=subscription` with monthly + one-time line items | Entry `price_1UG1eC3QQyESIKbfKbIfpHct` ($10,000 one_time) + dues `price_1UG1eD3QQyESIKbfZJOuoyS6` ($195/month) |

- Same price for everyone. **No coupons, promotion codes, or referral discounts.**
- Cancel monthly dues → membership ends. Rejoin requires a **new $10,000 entry**, then $195/month.
- Archived lifetime catalog `prod_VGYfTJu8zQwQsu` / `price_1UG1Xg3QQyESIKbfV5BfJF6U` is **never** charged.

## Preview env (never commit secrets)

| Variable | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | TEST secret or restricted key (`sk_test_` / `rk_test_`). Live keys are blocked outside Production + `NEXT_PUBLIC_RUNTIME_MODE=live`. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (hosted Checkout does not need Stripe.js). |
| `STRIPE_WEBHOOK_SECRET` | Verifies `/api/stripe/webhook`. Without it, webhooks stub and do not unlock. |
| `STRIPE_PRICE_FOUNDING_ENTRY` | `price_1UG1eB3QQyESIKbfGysIcPYf` |
| `STRIPE_PRICE_STANDARD_ENTRY` | `price_1UG1eC3QQyESIKbfKbIfpHct` |
| `STRIPE_PRICE_MONTHLY` | `price_1UG1eD3QQyESIKbfZJOuoyS6` |

Aliases: `STRIPE_FOUNDING_PRICE_ID`, `STRIPE_STANDARD_PRICE_ID`. `STRIPE_PRICE_ID` / `STRIPE_LIFETIME_PRICE_ID` are retired.

Without keys, Checkout and invoices return **501** and charge nothing.

## Webhooks

Endpoint: `https://<preview-host>/api/stripe/webhook`

| Event | Effect |
| --- | --- |
| `checkout.session.completed` | Unlock if paid (founding payment, or standard subscription session). |
| `checkout.session.async_payment_succeeded` | Same unlock for delayed methods. |
| `invoice.paid` | Unlock founding/standard entry or keep standard dues current. |
| `customer.subscription.updated` | `canceled` / `unpaid` / `incomplete_expired` → revoke. `active` → keep member. |
| `customer.subscription.deleted` | Revoke. Rejoin is Standard $10,000 + $195/month. |

Idempotent via `stripe_events.event_id`. Signature required when `STRIPE_WEBHOOK_SECRET` is set.

## Dashboard invoicing (manual admits)

1. Customers → member email.
2. Founding: invoice the $5,000 Price. Standard: prefer app Checkout (collects entry + starts dues). Entry-only invoice uses the $10,000 Price; still start the $195 subscription.
3. Metadata: `accountId`, `offer=founding|standard`.
4. Send → hosted invoice URL.

Admin helper: `POST /api/admin/billing/invoice` (`createEntryInvoice`) returns `hosted_invoice_url`.

## Member path

Reviewer tools → **Approved — payment pending** → `/member/billing` → **Continue to Stripe Checkout**. Success/cancel return to the same page. Portal is invoices/receipts (and dues for Standard), not a lifetime product.
