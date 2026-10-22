const router = require("express").Router();
const express = require("express");
const { store } = require("../store");
const { constructWebhookEvent } = require("../services/stripe");

// Stripe webhook — verifies the signature when STRIPE_WEBHOOK_SECRET is set;
// in demo mode it accepts the event JSON so the flow can be tested with curl.
router.post("/stripe", express.raw({ type: "application/json" }), (req, res) => {
  let event = null;
  try { event = constructWebhookEvent(req.body, req.headers["stripe-signature"]); } catch (e) { return res.status(400).json({ error: "Invalid signature" }); }
  if (!event) { try { event = JSON.parse(req.body.toString()); } catch { return res.status(400).json({ error: "Invalid payload" }); } }
  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object.id;
    const o = store.orders.find(x => x.stripePaymentIntentId === pi);
    if (o && o.status === "Placed") o.status = "Packed";
    console.log("[webhook] payment_intent.succeeded", pi, o ? `-> order ${o.id} Packed` : "(no matching order — demo mode)");
  }
  res.json({ received: true });
});
module.exports = router;
