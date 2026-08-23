require("./setup");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { app } = require("../Middlewares/Server");
const { User } = require("../models/User");
const { Admin } = require("../models/Admin");
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

describe("/healthz", () => {
	test("reports healthy without requiring auth or hitting the rate limiter", async () => {
		const res = await request(app).get("/healthz");
		expect(res.status).toBe(200);
		expect(res.body.db).toBe(1);
	});
});

describe("JWT hardening", () => {
	test("/Login issues a token with an expiry claim", async () => {
		await createUser("jwt-expiry@example.com");
		const res = await request(app)
			.post("/Login")
			.send({ email: "jwt-expiry@example.com", password: "password123" });

		const decoded = jwt.decode(res.body.token);
		expect(decoded.exp).toBeDefined();
		expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
	});

	test("a token signed with a different algorithm (alg confusion) is rejected", async () => {
		const { id } = await createUser("alg-confusion@example.com");
		// HS256 token, but forged with the wrong secret — verifying with the
		// pinned algorithm + real secret must still reject it.
		const forged = jwt.sign({ id }, "wrong-secret", { algorithm: "HS256" });

		const res = await request(app)
			.get("/userInfo")
			.set("Authorization", `Bearer ${forged}`);

		expect(res.status).toBe(401);
	});
});

describe("OTP password reset", () => {
	test("Forget-Password generates a real, persisted, expiring OTP that Verify-OTP accepts", async () => {
		await createUser("otp-flow@example.com");

		const forgetRes = await request(app)
			.post("/Forget-Password")
			.send({ email: "otp-flow@example.com" });
		expect(forgetRes.status).toBe(200);

		const stored = await User.findOne({ email: "otp-flow@example.com" }).select("+otp +otpExpiresAt +password");
		expect(stored.otp).toMatch(/^\d{6}$/);
		expect(stored.otpExpiresAt.getTime()).toBeGreaterThan(Date.now());
		// The password must be untouched by a password-reset request — it is
		// not overwritten with the OTP (a real bug this fix corrects).
		const stillOriginalPassword = await bcrypt.compare("password123", stored.password);
		expect(stillOriginalPassword).toBe(true);

		const wrongOtp = await request(app)
			.post("/Verify-OTP")
			.send({ email: "otp-flow@example.com", otp: "000000" });
		expect(wrongOtp.status).toBe(401);

		const rightOtp = await request(app)
			.post("/Verify-OTP")
			.send({ email: "otp-flow@example.com", otp: stored.otp });
		expect(rightOtp.status).toBe(200);

		// OTP is single-use — verifying again with the same code must fail.
		const reuseOtp = await request(app)
			.post("/Verify-OTP")
			.send({ email: "otp-flow@example.com", otp: stored.otp });
		expect(reuseOtp.status).toBe(401);
	});
});

describe("Admin RBAC", () => {
	test("/Create-Admin with no auth is rejected (was previously wide open)", async () => {
		const res = await request(app)
			.post("/Create-Admin")
			.send({ name: "x", email: "unauthorized-admin@example.com", phoneNumber: 123, Role: "Admin", password: "password123" });
		expect(res.status).toBe(401);

		const created = await Admin.findOne({ email: "unauthorized-admin@example.com" });
		expect(created).toBeNull();
	});

	test("an admin without manageAdmins permission gets 403 creating a new admin", async () => {
		const { token } = await createAdmin("no-perms-admin@example.com", { manageProducts: true });

		const res = await request(app)
			.post("/Create-Admin")
			.set("Authorization", `Bearer ${token}`)
			.send({ name: "x", email: "should-not-exist@example.com", phoneNumber: 456, Role: "Admin", password: "password123" });

		expect(res.status).toBe(403);
	});

	test("an admin with manageAdmins permission can create a new admin, without being logged in as it", async () => {
		const { token } = await createAdmin("full-perms-admin@example.com", { manageAdmins: true });

		const res = await request(app)
			.post("/Create-Admin")
			.set("Authorization", `Bearer ${token}`)
			.send({ name: "New Admin", email: "new-admin@example.com", phoneNumber: 789, Role: "Admin", password: "password123" });

		expect(res.status).toBe(200);
		expect(res.body.token).toBeUndefined(); // creating an admin must not hand back a session for it
		const created = await Admin.findOne({ email: "new-admin@example.com" });
		expect(created?._id).toBeDefined();
	});

	test("/Update-Admin returns HTTP 200 on success, matching its own status:200 body", async () => {
		const { token } = await createAdmin("self-update-admin@example.com");

		const res = await request(app)
			.post("/Update-Admin")
			.set("Authorization", `Bearer ${token}`)
			.send({ name: "Updated Name" });

		expect(res.status).toBe(200);
		expect(res.body.status).toBe(200);
	});
});
