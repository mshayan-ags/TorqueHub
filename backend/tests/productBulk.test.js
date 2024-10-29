require("./setup");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { app } = require("../Middlewares/Server");
const { Product } = require("../models/Product");
const { Brand } = require("../models/Brand");
const { Category } = require("../models/Category");
const { Admin } = require("../models/Admin");
const { APP_SECRET } = require("../utils/AuthCheck");

async function createAdmin(email, Responsiblities = {}) {
	const password = await bcrypt.hash("password123", 15);
	const admin = await Admin.create({
		name: email,
		email,
		phoneNumber: Math.floor(Math.random() * 1e9),
		Role: "Admin",
		password,
		Responsiblities
	});
	return jwt.sign({ id: admin._id, Role: admin.Role }, APP_SECRET, { expiresIn: "7d" });
}

// /Create-Product's HTTP route also requires a non-empty `images` array
// (fed through the real Azure-Blob upload pipeline), which is out of scope
// to exercise here — same reasoning as features.test.js's createProduct()
// helper bypassing it. createOneProduct()'s core validation/save logic is
// covered below via /Bulk-Create-Products, which shares that exact helper
// but never touches images.
describe("POST /Bulk-Create-Products", () => {
	test("requires manageProducts permission", async () => {
		const token = await createAdmin("bulk-no-perms@example.com", { manageOrders: true });
		const res = await request(app)
			.post("/Bulk-Create-Products")
			.set("Authorization", `Bearer ${token}`)
			.send({ rows: [] });
		expect(res.status).toBe(403);
	});

	test("imports valid rows and reports per-row failures for unknown brand/category", async () => {
		const token = await createAdmin("bulk-admin@example.com", { manageProducts: true });
		const brand = await Brand.create({ name: `BulkBrand${Date.now()}`, description: "d", country: "c", website: "w" });
		const category = await Category.create({ name: `BulkCategory${Date.now()}`, description: "d" });

		const res = await request(app)
			.post("/Bulk-Create-Products")
			.set("Authorization", `Bearer ${token}`)
			.send({
				rows: [
					{
						name: "Bulk Widget A",
						description: "d",
						price: 12,
						quantity: 2,
						currentColor: "-",
						currentSize: "-",
						currentMaterial: "-",
						specifications: "spec",
						brand: brand.name,
						category: category.name,
						ProductCode: `BULKA${Date.now()}`
					},
					{
						name: "Bulk Widget B",
						description: "d",
						price: 12,
						quantity: 2,
						currentColor: "-",
						currentSize: "-",
						currentMaterial: "-",
						specifications: "spec",
						brand: "NoSuchBrand",
						category: category.name,
						ProductCode: `BULKB${Date.now()}`
					}
				]
			});

		expect(res.status).toBe(200);
		expect(res.body.data.length).toBe(2);
		expect(res.body.data[0].success).toBe(true);
		expect(res.body.data[1].success).toBe(false);

		const created = await Product.findOne({ name: "Bulk Widget A" });
		expect(created?._id).toBeDefined();
		const notCreated = await Product.findOne({ name: "Bulk Widget B" });
		expect(notCreated).toBeNull();
	});

	test("persists fitment data and rejects a duplicate row within the same import", async () => {
		const token = await createAdmin("bulk-fitment-admin@example.com", { manageProducts: true });
		const brand = await Brand.create({ name: `FitBrand${Date.now()}`, description: "d", country: "c", website: "w" });
		const category = await Category.create({ name: `FitCategory${Date.now()}`, description: "d" });
		const code = `FIT${Date.now()}`;
		const baseRow = {
			description: "d",
			price: 18,
			quantity: 2,
			currentColor: "-",
			currentSize: "-",
			currentMaterial: "-",
			specifications: "spec",
			brand: brand.name,
			category: category.name,
			ProductCode: code
		};

		const res = await request(app)
			.post("/Bulk-Create-Products")
			.set("Authorization", `Bearer ${token}`)
			.send({
				rows: [
					{ ...baseRow, name: "Fitment Row", fitment: [{ make: "Toyota", model: "Corolla", yearStart: 2018, yearEnd: 2023 }] },
					{ ...baseRow, name: "Fitment Row Duplicate" }
				]
			});

		expect(res.status).toBe(200);
		expect(res.body.data[0].success).toBe(true);
		expect(res.body.data[1].success).toBe(false);
		expect(res.body.data[1].message).toMatch(/Already Exist/);

		const saved = await Product.findOne({ name: "Fitment Row" });
		expect(saved?.fitment?.[0]?.make).toBe("Toyota");
	});
});
