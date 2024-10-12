require("./setup");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { app } = require("../Middlewares/Server");
const { Admin } = require("../models/Admin");
const { AuditLog } = require("../models/AuditLog");
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
	return { token: jwt.sign({ id: admin._id, Role: admin.Role }, APP_SECRET, { expiresIn: "7d" }), admin };
}

// logAction() is fire-and-forget (never awaited by the route handler), so
// the AuditLog write can land slightly after the HTTP response — poll for
// it instead of asserting immediately.
async function waitForAuditLog(filter, timeoutMs = 2000) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		const found = await AuditLog.findOne(filter);
		if (found) return found;
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	return null;
}

describe("GET /GetAllAuditLog", () => {
	test("requires auth", async () => {
		const res = await request(app).get("/GetAllAuditLog");
		expect(res.status).toBe(401);
	});

	test("an admin without manageAdmins gets 403", async () => {
		const { token } = await createAdmin("no-audit-access@example.com", { manageProducts: true });
		const res = await request(app).get("/GetAllAuditLog").set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(403);
	});

	test("an admin with manageAdmins can list audit log entries", async () => {
		const { token, admin } = await createAdmin("audit-viewer@example.com", { manageAdmins: true });
		await AuditLog.create({
			Admin: admin._id,
			action: "Create-Coupon",
			targetType: "Coupon",
			summary: "Created coupon TEST10"
		});

		const res = await request(app).get("/GetAllAuditLog").set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(res.body.data.length).toBeGreaterThan(0);
		expect(res.body.data[0].summary).toBe("Created coupon TEST10");
	});
});

describe("Audit log retrofits", () => {
	test("Create-Coupon records an audit entry", async () => {
		const { token, admin } = await createAdmin("coupon-admin@example.com", { manageContent: true });

		const res = await request(app)
			.post("/Create-Coupon")
			.set("Authorization", `Bearer ${token}`)
			.send({
				code: `AUDIT${Date.now()}`,
				discountType: "Percentage",
				discountValue: 10,
				minimumPurchase: 5,
				expirationDate: new Date(Date.now() + 86400000).toISOString(),
				restrictions: "true"
			});
		expect(res.status).toBe(200);

		const entry = await waitForAuditLog({ Admin: admin._id, action: "Create-Coupon" });
		expect(entry).not.toBeNull();
		expect(entry.summary).toMatch(/AUDIT/);
	});
});
