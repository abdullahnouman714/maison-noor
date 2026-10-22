// Stripe service — real test-mode PaymentIntent when STRIPE_SECRET_KEY is set,
// otherwise demo confirmation (same order flow end-to-end).
async function createPaymentIntent({ amount, email }) {
  if (!process.env.STRIPE_SECRET_KEY) return { clientSecret: "demo_mode_no_stripe_key", paymentIntentId: null };
  const Stripe = require("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const pi = await stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency: "usd", metadata: { email } });
  return { clientSecret: pi.client_secret, paymentIntentId: pi.id };
}
function constructWebhookEvent(rawBody, signature) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return null;
  const Stripe = require("stripe");
  return new Stripe(process.env.STRIPE_SECRET_KEY).webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}
module.exports = { createPaymentIntent, constructWebhookEvent };
