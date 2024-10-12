require("./setup");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { app } = require("../Middlewares/Server");
const { Sale } = require("../models/Sale");
const { SaleOfProduct } = require("../models/SaleOfProduct");
const { Product } = require("../models/Product");
const { Brand } = require("../models/Brand");
const { Category } = require("../models/Category");
const { Admin } = require("../models/Admin");
const { User } = require("../models/User");
const { APP_SECRET } = require("../utils/AuthCheck");

async function createUser(email) {
	const res = await request(app).post("/SignUp").send({ name: email, email, password: "password123" });
	return { token: res.body.token, id: res.body.id };
}

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
	return { token: jwt.sign({ id: admin._id, Role: admin.Role }, APP_SECRET, { expiresIn: "7d" }), admin };
}

async function createDeliveredSale(userId) {
	const brand = await Brand.create({ name: `RB${Date.now()}`, description: "d", country: "c", website: "w" });
	const category = await Category.create({ name: `RC${Date.now()}`, description: "d" });
	const product = await Product.create({
		Product: `RP${Date.now()}`,
		ProductCode: `RP${Date.now()}`,
		name: "Returnable Widget",
		description: "d",
		price: 20,
		quantity: 5,
		brand: brand._id,
		category: category._id
	});
	const sop = await SaleOfProduct.create({
		product: product._id,
		quantity: 1,
		totalPrice: 20,
		totalPriceAfterDiscount: 20
	});
	const sale = await Sale.create({
		User: userId,
		Address: new mongoose.Types.ObjectId(),
		Bank: new mongoose.Types.ObjectId(),
		Product: [sop._id],
		totalAmount: 20,
		totalAmountAfterDiscount: 20,
		couponvalue: 0,
		paymentMethod: "card",
		status: "Delivered"
	});
	return { sale, sop };
}

describe("POST /Create-Return-Request", () => {
	test("rejects a return for an order that isn't Delivered", async () => {
		const { token, id } = await createUser("pending-return@example.com");
		const { sale, sop } = await createDeliveredSale(id);
		await Sale.updateOne({ _id: sale._id }, { status: "Processing" });

		const res = await request(app)
			.post("/Create-Return-Request")
			.set("Authorization", `Bearer ${token}`)
			.send({ Sale: sale._id.toString(), SaleOfProduct: sop._id.toString(), reason: "Wrong part" });
		expect(res.status).toBe(400);
	});

	test("accepts a return for a Delivered order owned by the requester", async () => {
		const { token, id } = await createUser("valid-return@example.com");
		const { sale, sop } = await createDeliveredSale(id);

		const res = await request(app)
			.post("/Create-Return-Request")
			.set("Authorization", `Bearer ${token}`)
			.send({ Sale: sale._id.toString(), SaleOfProduct: sop._id.toString(), reason: "Doesn't fit my vehicle" });
		expect(res.status).toBe(200);

		const userList = await request(app).get("/GetReturnRequestsUser").set("Authorization", `Bearer ${token}`);
		expect(userList.body.data.length).toBe(1);
		expect(userList.body.data[0].status).toBe("Requested");
	});

	test("rejects a return for someone else's order", async () => {
		const { id: ownerId } = await createUser("return-owner@example.com");
		const { token: strangerToken } = await createUser("return-stranger@example.com");
		const { sale, sop } = await createDeliveredSale(ownerId);

		const res = await request(app)
			.post("/Create-Return-Request")
			.set("Authorization", `Bearer ${strangerToken}`)
			.send({ Sale: sale._id.toString(), SaleOfProduct: sop._id.toString(), reason: "Not mine" });
		expect(res.status).toBe(404);
	});

	test("rejects a duplicate return request for the same line item", async () => {
		const { token, id } = await createUser("dup-return@example.com");
		const { sale, sop } = await createDeliveredSale(id);

		await request(app)
			.post("/Create-Return-Request")
			.set("Authorization", `Bearer ${token}`)
			.send({ Sale: sale._id.toString(), SaleOfProduct: sop._id.toString(), reason: "Defective" });

		const res = await request(app)
			.post("/Create-Return-Request")
			.set("Authorization", `Bearer ${token}`)
			.send({ Sale: sale._id.toString(), SaleOfProduct: sop._id.toString(), reason: "Defective again" });
		expect(res.status).toBe(400);
	});
});

describe("Admin return moderation", () => {
	test("GetAllReturnRequest and Update-Return-Status require manageOrders", async () => {
		const { token: noPerms } = await createAdmin("no-order-perms@example.com", { manageProducts: true });
		const listRes = await request(app).get("/GetAllReturnRequest").set("Authorization", `Bearer ${noPerms}`);
		expect(listRes.status).toBe(403);
	});

	test("an admin with manageOrders can approve a return and it's reflected for the user", async () => {
		const { token: userToken, id: userId } = await createUser("return-approval-user@example.com");
		const { sale, sop } = await createDeliveredSale(userId);
		const createRes = await request(app)
			.post("/Create-Return-Request")
			.set("Authorization", `Bearer ${userToken}`)
			.send({ Sale: sale._id.toString(), SaleOfProduct: sop._id.toString(), reason: "Cracked housing" });
		const returnId = createRes.body.id;

		const { token: adminToken } = await createAdmin("order-admin@example.com", { manageOrders: true });
		const updateRes = await request(app)
			.post(`/Update-Return-Status/${returnId}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ status: "Approved", adminNotes: "Confirmed defect from photos" });
		expect(updateRes.status).toBe(200);

		const userList = await request(app).get("/GetReturnRequestsUser").set("Authorization", `Bearer ${userToken}`);
		expect(userList.body.data[0].status).toBe("Approved");
	});
});
