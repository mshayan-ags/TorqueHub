const Express = require("express");
const { Router } = require("express");
const { getStripeClient } = require("../Middlewares/Db");
const { PendingSale } = require("../models/PendingSale");
const { createSaleFromOrder } = require("../utils/orderFulfillment");

const router = Router();

router.post("/", Express.raw({ type: "application/json" }), async (req, res) => {
	let event;

	try {
		const stripe = await getStripeClient();
		const signature = req.headers["stripe-signature"];
		event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
	} catch (err) {
		console.error("Stripe webhook signature verification failed:", err?.message);
		return res.status(400).send(`Webhook Error: ${err?.message}`);
	}

	try {
		if (event.type === "payment_intent.succeeded") {
			const intent = event.data.object;
			const pending = await PendingSale.findOne({ stripePaymentIntentId: intent.id });

			if (pending?._id && pending?.status !== "Completed") {
				const { sale } = await createSaleFromOrder(
					{ ...pending.orderPayload, stripePaymentIntentId: intent.id },
					pending.User
				);
				await PendingSale.updateOne(
					{ _id: pending._id },
					{ status: "Completed", Sale: sale?._id },
					{ new: false }
				);
			}
		}

		res.status(200).json({ received: true });
	} catch (err) {
		console.error("Stripe webhook handling failed:", err);
		res.status(500).json({ received: false });
	}
});

module.exports = router;
