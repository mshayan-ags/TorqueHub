require("./setup");
const request = require("supertest");
const { app } = require("../Middlewares/Server");
const { getStripeClient } = require("../Middlewares/Db");
const { PendingSale } = require("../models/PendingSale");
const { Sale } = require("../models/Sale");
const { Address } = require("../models/Address");
const { Bank } = require("../models/Bank");
const { Product } = require("../models/Product");
const { Brand } = require("../models/Brand");
const { Category } = require("../models/Category");

async function createUser(email) {
	const res = await request(app).post("/SignUp").send({ name: email, email, password: "password123" });
	return { token: res.body.token, id: res.body.id };
}

async function buildOrderPayload(userId) {
	const brand = await Brand.create({ name: "TestBrand", description: "d", country: "c", website: "w" });
	const category = await Category.create({ name: "TestCategory", description: "d" });
	const productCode = `TP${Date.now()}${Math.floor(Math.random() * 1000)}`;
	const product = await Product.create({
		Product: productCode,
		ProductCode: productCode,
		name: "Test Product",
		description: "d",
		price: 10,
		quantity: 5,
		brand: brand._id,
		category: category._id
	});

	const address = await Address.create({
		User: userId,
		full_name: "A",
		phone_number: "123",
		address_line1: "1 Main St",
		city: "City",
		state: "State",
		postal_code: "00000",
		country: "Country"
	});

	const bank = await Bank.create({
		User: userId,
		bank_name: "Visa",
		account_number: "4242",
		account_detail: "visa_4242",
		country: "US",
		stripeID: "pm_test_dummy",
		is_verified: true
	});

	return {
		Product: [{ ProductID: product._id.toString(), quantity: 1 }],
		Address: address._id.toString(),
		Bank: bank._id.toString(),
		paymentMethod: "card",
		Total: 10
	};
}

describe("Stripe webhook idempotency", () => {
	test("posting the same payment_intent.succeeded event twice creates exactly one Sale", async () => {
		const { id: userId } = await createUser("webhook-user@example.com");
		const orderPayload = await buildOrderPayload(userId);

		const intentId = `pi_test_${Date.now()}`;
		await PendingSale.create({
			User: userId,
			stripePaymentIntentId: intentId,
			orderPayload
		});

		const stripe = await getStripeClient();
		const payload = JSON.stringify({
			id: "evt_test",
			type: "payment_intent.succeeded",
			data: { object: { id: intentId } }
		});
		const header = stripe.webhooks.generateTestHeaderString({
			payload,
			secret: process.env.STRIPE_WEBHOOK_SECRET
		});

		const first = await request(app)
			.post("/Stripe-Webhook")
			.set("Content-Type", "application/json")
			.set("stripe-signature", header)
			.send(payload);
		expect(first.status).toBe(200);

		const second = await request(app)
			.post("/Stripe-Webhook")
			.set("Content-Type", "application/json")
			.set("stripe-signature", header)
			.send(payload);
		expect(second.status).toBe(200);

		const sales = await Sale.find({ stripePaymentIntentId: intentId });
		expect(sales.length).toBe(1);
	});

	test("a card payment (Bank: null in orderPayload, the real storefront flow) still creates a Sale", async () => {
		const { id: userId } = await createUser("card-payment-user@example.com");
		const orderPayload = await buildOrderPayload(userId);
		orderPayload.Bank = null;

		const intentId = `pi_test_card_${Date.now()}`;
		await PendingSale.create({
			User: userId,
			stripePaymentIntentId: intentId,
			orderPayload
		});

		const stripe = await getStripeClient();
		const payload = JSON.stringify({
			id: "evt_test_card",
			type: "payment_intent.succeeded",
			data: { object: { id: intentId } }
		});
		const header = stripe.webhooks.generateTestHeaderString({
			payload,
			secret: process.env.STRIPE_WEBHOOK_SECRET
		});

		const res = await request(app)
			.post("/Stripe-Webhook")
			.set("Content-Type", "application/json")
			.set("stripe-signature", header)
			.send(payload);
		expect(res.status).toBe(200);

		const sale = await Sale.findOne({ stripePaymentIntentId: intentId });
		expect(sale?._id).toBeDefined();
		expect(sale?.Bank).toBeUndefined();
	});
});
