require("./setup");
const request = require("supertest");
const { app } = require("../Middlewares/Server");

describe("Auth: /Login and /Change-Password", () => {
	const credentials = { name: "Test User", email: "test@example.com", password: "correct-password" };

	beforeEach(async () => {
		await request(app).post("/SignUp").send(credentials);
	});

	test("rejects login with a wrong password", async () => {
		const res = await request(app)
			.post("/Login")
			.send({ email: credentials.email, password: "wrong-password" });

		expect(res.status).toBe(500);
		expect(res.body.message).toMatch(/incorrect/i);
		expect(res.body.token).toBeUndefined();
	});

	test("accepts login with the correct password", async () => {
		const res = await request(app)
			.post("/Login")
			.send({ email: credentials.email, password: credentials.password });

		expect(res.status).toBe(200);
		expect(res.body.token).toBeDefined();
	});

	test("rejects /Change-Password with the wrong current password", async () => {
		const res = await request(app)
			.post("/Change-Password")
			.send({ email: credentials.email, password: "wrong-password", newPassword: "new-password" });

		expect(res.status).toBe(500);
		expect(res.body.message).toMatch(/not valid/i);
	});

	test("accepts /Change-Password with the correct current password", async () => {
		const res = await request(app)
			.post("/Change-Password")
			.send({ email: credentials.email, password: credentials.password, newPassword: "new-password" });

		expect(res.status).toBe(200);
	});
});
