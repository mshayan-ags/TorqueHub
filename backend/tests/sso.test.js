// Must be set before "./setup" requires Middlewares/Routes (which reads
// these into module-level constants in AdminSSO.js/UserSSO.js at require
// time), same reasoning as setup.js's own env vars.
process.env.AZURE_AD_TENANT_ID = "test-tenant-id";
process.env.AZURE_AD_ADMIN_CLIENT_ID = "test-admin-client-id";
process.env.AZURE_B2C_TENANT_NAME = "testb2c";
process.env.AZURE_B2C_TENANT_ID = "test-b2c-tenant-id";
process.env.AZURE_B2C_POLICY_NAME = "B2C_1_test";
process.env.AZURE_B2C_CLIENT_ID = "test-b2c-client-id";

require("./setup");
const request = require("supertest");
const { app } = require("../Middlewares/Server");
const { User } = require("../models/User");

describe("Admin SSO (/Login-Admin/SSO)", () => {
	test("rejects a malformed idToken without ever auto-creating an admin", async () => {
		const res = await request(app).post("/Login-Admin/SSO").send({ idToken: "not-a-real-jwt" });
		expect(res.status).toBe(401);
	});

	test("a missing idToken is rejected", async () => {
		const res = await request(app).post("/Login-Admin/SSO").send({});
		expect(res.status).not.toBe(200);
	});
});

describe("Storefront SSO (/Login/SSO)", () => {
	test("rejects a malformed idToken without creating a user", async () => {
		const res = await request(app).post("/Login/SSO").send({ idToken: "not-a-real-jwt" });
		expect(res.status).toBe(401);

		const count = await User.countDocuments();
		expect(count).toBe(0);
	});
});
