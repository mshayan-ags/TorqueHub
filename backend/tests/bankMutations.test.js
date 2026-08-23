require("./setup");
const request = require("supertest");
const { app } = require("../Middlewares/Server");

async function createUser(email) {
	const res = await request(app).post("/SignUp").send({ name: email, email, password: "password123" });
	return res.body.token;
}

async function createBank(token) {
	const res = await request(app)
		.post("/Create-Bank")
		.set("Authorization", `Bearer ${token}`)
		.send({
			bank_name: "Visa",
			account_number: "4242",
			country: "USA",
			is_verified: true,
			account_detail: `visa_${Date.now()}`,
			stripeID: `pm_test_${Date.now()}`
		});
	return res.body.id;
}

describe("Update-Bank / Delete-Bank", () => {
	test("the owner can update their own bank", async () => {
		const token = await createUser("bank-owner-update@example.com");
		const bankId = await createBank(token);
		expect(bankId).toBeDefined();

		const res = await request(app)
			.post(`/Update-Bank/${bankId}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ bank_name: "Mastercard" });

		expect(res.status).toBe(200);
	});

	test("the owner can delete their own bank", async () => {
		const token = await createUser("bank-owner-delete@example.com");
		const bankId = await createBank(token);

		const res = await request(app)
			.post(`/Delete-Bank/${bankId}`)
			.set("Authorization", `Bearer ${token}`)
			.send({});

		expect(res.status).toBe(200);
	});

	test("a user cannot update another user's bank", async () => {
		const tokenA = await createUser("bank-a@example.com");
		const tokenB = await createUser("bank-b@example.com");
		const bankId = await createBank(tokenA);

		const res = await request(app)
			.post(`/Update-Bank/${bankId}`)
			.set("Authorization", `Bearer ${tokenB}`)
			.send({ bank_name: "Hijacked" });

		expect(res.status).toBe(403);
	});

	test("a user cannot delete another user's bank", async () => {
		const tokenA = await createUser("bank-c@example.com");
		const tokenB = await createUser("bank-d@example.com");
		const bankId = await createBank(tokenA);

		const res = await request(app)
			.post(`/Delete-Bank/${bankId}`)
			.set("Authorization", `Bearer ${tokenB}`)
			.send({});

		expect(res.status).toBe(403);
	});
});
