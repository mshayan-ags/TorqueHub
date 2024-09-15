// No AZURE_AD_*/AZURE_B2C_* env vars are set in this file (unlike
// sso.test.js) — this exercises both SSO routes in their default,
// unconfigured state (the common case for anyone who hasn't set up Azure
// AD / B2C yet), which must fail closed rather than crash.
require("./setup");
const request = require("supertest");
const { app } = require("../Middlewares/Server");

describe("SSO routes when unconfigured", () => {
	test("/Login-Admin/SSO reports not configured instead of crashing", async () => {
		const res = await request(app).post("/Login-Admin/SSO").send({ idToken: "anything" });
		expect(res.status).toBe(500);
		expect(res.body.message).toMatch(/not configured/i);
	});

	test("/Login/SSO reports not configured instead of crashing", async () => {
		const res = await request(app).post("/Login/SSO").send({ idToken: "anything" });
		expect(res.status).toBe(500);
		expect(res.body.message).toMatch(/not configured/i);
	});
});
