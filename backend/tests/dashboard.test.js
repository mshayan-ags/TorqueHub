require("./setup");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { app } = require("../Middlewares/Server");
const { Sale } = require("../models/Sale");
const { Admin } = require("../models/Admin");
const { User } = require("../models/User");
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

describe("GET /Dashboard-Stats", () => {
	test("includes ordersByDay alongside the existing revenue aggregates", async () => {
		const token = await createAdmin("dashboard-admin@example.com");
		const user = await User.create({ name: "Dash User", email: "dash-user@example.com", password: "x", stripeID: "dash-stripe" });
		await Sale.create({
			User: user._id,
			Address: new mongoose.Types.ObjectId(),
			Bank: new mongoose.Types.ObjectId(),
			totalAmount: 50,
			totalAmountAfterDiscount: 50,
			couponvalue: 0,
			paymentMethod: "card",
			status: "Delivered"
		});

		const res = await request(app).get("/Dashboard-Stats").set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data.ordersByDay)).toBe(true);
		expect(res.body.data.ordersByDay.length).toBe(14);

		const today = new Date().toISOString().slice(0, 10);
		const todayEntry = res.body.data.ordersByDay.find((d) => d.date === today);
		expect(todayEntry?.count).toBeGreaterThanOrEqual(1);
	});
});
