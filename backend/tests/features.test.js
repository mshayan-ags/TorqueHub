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

async function createUser(email) {
	const res = await request(app).post("/SignUp").send({ name: email, email, password: "password123" });
	return { token: res.body.token, id: res.body.id };
}

// Created directly via the model (not the now-permission-gated
// /Create-Admin HTTP endpoint, which requires an already-authenticated
// manageAdmins admin — bootstrapping the very first admin isn't its job).
// Mirrors createProduct()'s existing rationale for the same pattern.
async function createAdmin(email) {
	const password = await bcrypt.hash("password123", 15);
	const admin = await Admin.create({
		name: email,
		email,
		phoneNumber: Math.floor(Math.random() * 1e9),
		Role: "Admin",
		password,
		Responsiblities: { manageProducts: true, manageOrders: true, manageUsers: true, manageAdmins: true, manageContent: true }
	});
	return jwt.sign({ id: admin._id, Role: admin.Role }, APP_SECRET, { expiresIn: "7d" });
}

// Created directly via the model (not the /Create-Product HTTP endpoint)
// to avoid needing to exercise the Azure Blob image-upload pipeline just
// to get a product to attach a wishlist/review to.
async function createProduct() {
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
	return product;
}

describe("Image serving", () => {
	test("GetImage route is mounted and redirects to a real (http) blobUrl", async () => {
		const { Image } = require("../models/Image");
		const image = await Image.create({
			filename: "real-image.svg",
			mimetype: "image/svg+xml",
			blobUrl: "https://example.blob.core.windows.net/uploads/real-image.svg",
			blobName: "real-image.svg",
			containerName: "uploads"
		});

		const res = await request(app).get(`/GetImage/${image.filename}`);
		expect(res.status).toBe(302);
		expect(res.headers.location).toBe(image.blobUrl);
	});

	test("GetImage decodes and serves a data: blobUrl directly (browsers block redirect-to-data-URI)", async () => {
		const { Image } = require("../models/Image");
		const svgContent = "<svg></svg>";
		const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;
		const image = await Image.create({
			filename: "test-image.svg",
			mimetype: "image/svg+xml",
			blobUrl: dataUri,
			blobName: "test-image.svg",
			containerName: "test"
		});

		const res = await request(app).get(`/GetImage/${image.filename}`);
		expect(res.status).toBe(200);
		expect(res.headers["content-type"]).toMatch(/image\/svg\+xml/);
		expect(Buffer.from(res.body).toString("utf8")).toBe(svgContent);
	});

	test("responses allow cross-origin resource loading (storefront/admin run on different ports)", async () => {
		const res = await request(app).get("/GetAllProductsUser");
		expect(res.headers["cross-origin-resource-policy"]).toBe("cross-origin");
	});
});

describe("Create-Bank", () => {
	test("responds instead of hanging, and returns the created bank id", async () => {
		const { token } = await createUser("bank-user@example.com");
		const res = await request(app)
			.post("/Create-Bank")
			.set("Authorization", `Bearer ${token}`)
			.send({
				bank_name: "Visa",
				account_number: "4242",
				country: "USA",
				is_verified: true,
				account_detail: "visa_4242_test",
				stripeID: "pm_test_unique_1"
			});
		expect(res.status).toBe(200);
		expect(res.body.id).toBeDefined();
	});
});

describe("Wishlist", () => {
	test("add then remove a product round-trips cleanly", async () => {
		const { token } = await createUser("wishlist-user@example.com");
		const adminToken = await createAdmin("wishlist-admin@example.com");
		const product = await createProduct();

		const addRes = await request(app)
			.post("/Add-To-Wishlist")
			.set("Authorization", `Bearer ${token}`)
			.send({ product: product._id.toString() });
		expect(addRes.status).toBe(200);

		const getRes = await request(app)
			.get("/GetWishlist")
			.set("Authorization", `Bearer ${token}`);
		expect(getRes.status).toBe(200);
		expect(getRes.body.data.map((p) => p._id.toString())).toContain(product._id.toString());

		const removeRes = await request(app)
			.post("/Remove-From-Wishlist")
			.set("Authorization", `Bearer ${token}`)
			.send({ product: product._id.toString() });
		expect(removeRes.status).toBe(200);

		const getRes2 = await request(app)
			.get("/GetWishlist")
			.set("Authorization", `Bearer ${token}`);
		expect(getRes2.body.data.map((p) => p._id.toString())).not.toContain(product._id.toString());
	});
});

describe("Review moderation", () => {
	test("a review is invisible until an admin approves it", async () => {
		const { token } = await createUser("review-user@example.com");
		const adminToken = await createAdmin("review-admin@example.com");
		const product = await createProduct();

		const createRes = await request(app)
			.post("/Create-Review")
			.set("Authorization", `Bearer ${token}`)
			.send({ targetType: "Product", targetId: product._id.toString(), rating: 5, comment: "Great!" });
		expect(createRes.status).toBe(200);
		const reviewId = createRes.body.id;

		const beforeApprove = await request(app).get(`/GetApprovedReviews/Product/${product._id}`);
		expect(beforeApprove.body.data.length).toBe(0);

		const approveRes = await request(app)
			.post(`/Approve-Review/${reviewId}`)
			.set("Authorization", `Bearer ${adminToken}`);
		expect(approveRes.status).toBe(200);

		const afterApprove = await request(app).get(`/GetApprovedReviews/Product/${product._id}`);
		expect(afterApprove.body.data.length).toBe(1);
	});
});
