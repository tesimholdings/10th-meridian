import Stripe from "stripe";
import { env, hasStripe } from "@/lib/env";
import { isLiveStripeKey } from "@/lib/stripe/catalog";

let stripe: Stripe | null = null;

/** Instance client. Never assign a module-level API key. */
export function getStripe(): Stripe | null {
  if (!hasStripe()) return null;
  if (!stripe) {
    stripe = new Stripe(env.stripeSecretKey);
  }
  return stripe;
}

/** Test-only: drop the cached client after env mutations. */
export function resetStripeClient() {
  stripe = null;
}

export type StripeKeyMode = "stub" | "test-keys-present" | "live-keys-blocked" | "live-keys-present";

export function stripeMode(): StripeKeyMode {
  if (!hasStripe()) return "stub";
  if (isLiveStripeKey(env.stripeSecretKey)) {
    return env.isProduction && env.runtimeMode === "live" ? "live-keys-present" : "live-keys-blocked";
  }
  return "test-keys-present";
}
