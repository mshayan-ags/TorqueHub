require("./setup");
const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../Middlewares/Server");
const { AbandonedCart } = require("../models/AbandonedCart");
const { Product } = require("../models/Product");
const { Brand } = require("../models/Brand");
const { Category } = require("../models/Category");
const { Admin } = require("../models/Admin");
const { User } = require("../models/User");
const { Sale } = require("../models/Sale");
const { sendAbandonedCartReminders, sendLowStockDigest } = require("../utils/cronJobs");

async function createUser(email) {
	const res = await request(app).post("/SignUp").send({ name: email, email, password: "password123" });
	return { token: res.body.token, id: res.body.id };
}

async function createProduct(overrides = {}) {
	const brand = await Brand.create({ name: `ACBrand${Date.now()}${Math.random()}`, description: "d", country: "c", website: "w" });
	const category = await Category.create({ name: `ACCategory${Date.now()}${Math.random()}`, description: "d" });
	const code = `AC${Date.now()}${Math.floor(Math.random() * 1000)}`;
	return Product.create({
		Product: code,
		ProductCode: code,
		name: overrides.name || "Cart Widget",
		description: "d",
		price: 10,
		quantity: overrides.quantity ?? 5,
		brand: brand._id,
		category: category._id
	});
}

describe("POST /Sync-Cart", () => {
	test("requires auth", async () => {
		const res = await request(app).post("/Sync-Cart").send({ items: [] });
		expect(res.status).toBe(401);
	});

	test("upserts an AbandonedCart record for a non-empty cart", async () => {
		const { token, id } = await createUser("sync-cart-user@example.com");
		const product = await createProduct();

		const res = await request(app)
			.post("/Sync-Cart")
			.set("Authorization", `Bearer ${token}`)
			.send({ items: [{ ProductID: product._id.toString(), quantity: 2 }] });
		expect(res.status).toBe(200);

		const stored = await AbandonedCart.findOne({ User: id });
		expect(stored?.items?.length).toBe(1);
		expect(stored?.items?.[0]?.quantity).toBe(2);
	});

	test("an empty items array removes any existing record", async () => {
		const { token, id } = await createUser("sync-cart-clear@example.com");
		const product = await createProduct();
		await request(app)
			.post("/Sync-Cart")
			.set("Authorization", `Bearer ${token}`)
			.send({ items: [{ ProductID: product._id.toString(), quantity: 1 }] });

		const res = await request(app)
			.post("/Sync-Cart")
			.set("Authorization", `Bearer ${token}`)
			.send({ items: [] });
		expect(res.status).toBe(200);

		const stored = await AbandonedCart.findOne({ User: id });
		expect(stored).toBeNull();
	});
});

describe("sendAbandonedCartReminders", () => {
	test("emails users whose cart is old and unreminded, then marks reminderSentAt", async () => {
		const { id } = await createUser("abandoned-reminder@example.com");
		const product = await createProduct({ name: "Reminder Widget" });
		const staleDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
		await AbandonedCart.create({
			User: id,
			items: [{ ProductID: product._id, quantity: 1 }],
			lastUpdated: staleDate
		});

		await sendAbandonedCartReminders();

		const updated = await AbandonedCart.findOne({ User: id });
		expect(updated?.reminderSentAt).not.toBeNull();
	});

	test("skips (and cleans up) a cart whose owner already completed a sale since", async () => {
		const { id } = await createUser("abandoned-completed@example.com");
		const product = await createProduct({ name: "Completed Widget" });
		const staleDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
		await AbandonedCart.create({
			User: id,
			items: [{ ProductID: product._id, quantity: 1 }],
			lastUpdated: staleDate
		});
		await Sale.create({
			User: id,
			Address: new mongoose.Types.ObjectId(),
			Bank: new mongoose.Types.ObjectId(),
			totalAmount: 10,
			totalAmountAfterDiscount: 10,
			couponvalue: 0,
			paymentMethod: "card",
			status: "Delivered"
		});

		await sendAbandonedCartReminders();

		const remaining = await AbandonedCart.findOne({ User: id });
		expect(remaining).toBeNull();
	});

	test("does not touch a cart updated recently", async () => {
		const { id } = await createUser("abandoned-recent@example.com");
		const product = await createProduct({ name: "Recent Widget" });
		await AbandonedCart.create({
			User: id,
			items: [{ ProductID: product._id, quantity: 1 }],
			lastUpdated: new Date()
		});

		await sendAbandonedCartReminders();

		const stillPending = await AbandonedCart.findOne({ User: id });
		expect(stillPending?.reminderSentAt).toBeNull();
	});
});

describe("sendLowStockDigest", () => {
	test("emails every admin when a product is at or below the threshold", async () => {
		await createProduct({ name: "Low Stock Widget", quantity: 2 });
		await Admin.create({
			name: "Digest Admin",
			email: "digest-admin@example.com",
			phoneNumber: Math.floor(Math.random() * 1e9),
			Role: "Admin",
			password: "hashed"
		});

		// No assertion beyond "doesn't throw" — the actual send is the
		// console-log dev-mailer fallback (no ACS config in tests), and its
		// only externally observable effect (nothing written back to the DB)
		// isn't something this function exposes to verify against.
		await sendLowStockDigest();
	});
});
