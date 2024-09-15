require("./setup");
const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../Middlewares/Server");
const { Product } = require("../models/Product");
const { Brand } = require("../models/Brand");
const { Category } = require("../models/Category");
const { Sale } = require("../models/Sale");
const { User } = require("../models/User");

async function createUser(email) {
	const res = await request(app).post("/SignUp").send({ name: email, email, password: "password123" });
	return { token: res.body.token, id: res.body.id };
}

let brandCounter = 0;
async function createProduct(overrides = {}) {
	brandCounter += 1;
	const brand = await Brand.create({ name: overrides.brandName || `TestBrand${brandCounter}`, description: "d", country: "c", website: "w" });
	const category = await Category.create({ name: overrides.categoryName || `TestCategory${brandCounter}`, description: "d" });
	const productCode = `TP${Date.now()}${Math.floor(Math.random() * 1000)}`;
	const product = await Product.create({
		Product: productCode,
		ProductCode: productCode,
		name: overrides.name || "Test Product",
		description: overrides.description || "d",
		price: 10,
		quantity: 5,
		brand: brand._id,
		category: category._id
	});
	return product;
}

describe("GET /SearchProducts", () => {
	test("an empty query returns no results instead of the whole catalog", async () => {
		await createProduct();
		const res = await request(app).get("/SearchProducts").query({ q: "" });
		expect(res.status).toBe(200);
		expect(res.body.data).toEqual([]);
	});

	test("matches by partial product name", async () => {
		const product = await createProduct({ name: "Ceramic Brake Pad" });
		await createProduct({ name: "Oil Filter" });

		const res = await request(app).get("/SearchProducts").query({ q: "brake" });
		expect(res.status).toBe(200);
		const ids = res.body.data.map((p) => p._id);
		expect(ids).toContain(product._id.toString());
		expect(ids.length).toBe(1);
	});

	test("matches by brand name", async () => {
		const product = await createProduct({ name: "Widget", brandName: "Bosch" });
		const res = await request(app).get("/SearchProducts").query({ q: "bosch" });
		expect(res.body.data.map((p) => p._id)).toContain(product._id.toString());
	});

	test("does not return archived products", async () => {
		const product = await createProduct({ name: "Discontinued Widget" });
		await Product.updateOne({ _id: product._id }, { isArchive: true });

		const res = await request(app).get("/SearchProducts").query({ q: "discontinued" });
		expect(res.body.data.map((p) => p._id)).not.toContain(product._id.toString());
	});
});

describe("GET /RelatedProducts/:id", () => {
	test("returns other products sharing the same category, excluding itself", async () => {
		const brand = await Brand.create({ name: "SharedBrand", description: "d", country: "c", website: "w" });
		const category = await Category.create({ name: "SharedCategory", description: "d" });

		const makeIn = async (name) => Product.create({
			Product: `${name}-${Date.now()}-${Math.random()}`,
			ProductCode: `${name}-${Date.now()}`,
			name,
			description: "d",
			price: 10,
			quantity: 5,
			brand: brand._id,
			category: category._id
		});

		const main = await makeIn("Main Product");
		const related = await makeIn("Related Product");
		const unrelated = await createProduct({ name: "Unrelated Product" });

		const res = await request(app).get(`/RelatedProducts/${main._id}`);
		expect(res.status).toBe(200);
		const ids = res.body.data.map((p) => p._id);
		expect(ids).not.toContain(main._id.toString());
		expect(ids).toContain(related._id.toString());
		expect(ids).not.toContain(unrelated._id.toString());
	});

	test("a non-existent product id is a 404", async () => {
		const res = await request(app).get(`/RelatedProducts/${new mongoose.Types.ObjectId()}`);
		expect(res.status).toBe(404);
	});
});

describe("GET /Track-Guest-Order", () => {
	async function createSale(email) {
		const user = await User.create({ name: email, email, password: "x", stripeID: `${email}-stripe` });
		const sale = await Sale.create({
			User: user._id,
			Address: new mongoose.Types.ObjectId(),
			Bank: new mongoose.Types.ObjectId(),
			totalAmount: 100,
			totalAmountAfterDiscount: 100,
			couponvalue: 0,
			paymentMethod: "card"
		});
		return sale;
	}

	test("returns the order when the email matches", async () => {
		const sale = await createSale("guest-tracker@example.com");
		const res = await request(app)
			.get("/Track-Guest-Order")
			.query({ orderId: sale._id.toString(), email: "guest-tracker@example.com" });
		expect(res.status).toBe(200);
		expect(res.body.data._id).toBe(sale._id.toString());
	});

	test("a wrong email is a generic 404, not a 403/mismatch-specific error", async () => {
		const sale = await createSale("real-owner@example.com");
		const res = await request(app)
			.get("/Track-Guest-Order")
			.query({ orderId: sale._id.toString(), email: "someone-else@example.com" });
		expect(res.status).toBe(404);
	});

	test("a non-existent order id is the same generic 404 (no enumeration signal)", async () => {
		const res = await request(app)
			.get("/Track-Guest-Order")
			.query({ orderId: new mongoose.Types.ObjectId().toString(), email: "nobody@example.com" });
		expect(res.status).toBe(404);
	});

	test("a malformed order id is rejected as 404 rather than crashing", async () => {
		const res = await request(app)
			.get("/Track-Guest-Order")
			.query({ orderId: "not-an-object-id", email: "nobody@example.com" });
		expect(res.status).toBe(404);
	});
});
