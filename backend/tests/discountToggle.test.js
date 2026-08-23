require("./setup");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { app } = require("../Middlewares/Server");
const { Admin } = require("../models/Admin");
const { Discount } = require("../models/Discount");
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

describe("Update-Discount", () => {
	test("a successful update returns 200 instead of always reporting 500", async () => {
		const token = await createAdmin("discount-success-admin@example.com");
		const discount = await Discount.create({
			type: "Product",
			DiscountType: "Percentage",
			value: 10,
			startDate: new Date(),
			endDate: new Date(Date.now() + 86400000),
			isActive: true
		});

		const res = await request(app)
			.post(`/Update-Discount/${discount._id}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ value: 20 });
		expect(res.status).toBe(200);

		const updated = await Discount.findOne({ _id: discount._id });
		expect(updated.value).toBe(20);
	});

	test("explicitly setting isActive to false actually deactivates the discount", async () => {
		const token = await createAdmin("toggle-discount-admin@example.com");
		const discount = await Discount.create({
			type: "Product",
			DiscountType: "Percentage",
			value: 10,
			startDate: new Date(),
			endDate: new Date(Date.now() + 86400000),
			isActive: true
		});

		const res = await request(app)
			.post(`/Update-Discount/${discount._id}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ isActive: false });
		expect(res.status).toBe(200);

		const updated = await Discount.findOne({ _id: discount._id });
		expect(updated.isActive).toBe(false);
	});
});
