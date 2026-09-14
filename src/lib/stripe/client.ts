import Stripe from "stripe";
import { env, hasStripe } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!hasStripe()) return null;
  if (!stripe) {
    stripe = new Stripe(env.stripeSecretKey);
  }
  return stripe;
}

export function stripeMode() {
  return hasStripe() ? "live-keys-present" : "stub";
}
