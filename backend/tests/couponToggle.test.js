require("./setup");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { app } = require("../Middlewares/Server");
const { Admin } = require("../models/Admin");
const { Coupon } = require("../models/Coupon");
const { APP_SECRET } = require("../utils/AuthCheck");

async function createAdmin(email, Responsiblities = { manageContent: true }) {
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

describe("Update-Coupon isActive toggle", () => {
	test("explicitly setting isActive to false actually deactivates the coupon", async () => {
		const token = await createAdmin("toggle-coupon-admin@example.com");
		const coupon = await Coupon.create({
			code: `TOGGLE${Date.now()}`,
			discountType: "FixedAmount",
			discountValue: 5,
			minimumPurchase: 1,
			expirationDate: new Date(Date.now() + 86400000),
			restrictions: "true",
			isActive: true
		});

		const res = await request(app)
			.post(`/Update-Coupon/${coupon._id}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ isActive: false });
		expect(res.status).toBe(200);

		const updated = await Coupon.findOne({ _id: coupon._id });
		expect(updated.isActive).toBe(false);
	});
});
