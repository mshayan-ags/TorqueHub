require("./setup");
const request = require("supertest");
const { app } = require("../Middlewares/Server");

async function createUser(email) {
	const res = await request(app)
		.post("/SignUp")
		.send({ name: email, email, password: "password123" });
	return res.body.token;
}

describe("Missing Authorization header", () => {
	test("a protected route with no Authorization header returns 401, not a 500 crash", async () => {
		const res = await request(app).get("/GetAllAddressUser");
		expect(res.status).toBe(401);
	});

	test("an admin-protected route with no Authorization header returns 401, not a 500 crash", async () => {
		const res = await request(app).get("/GetAllUsers");
		expect(res.status).toBe(401);
	});
});

describe("Ownership checks", () => {
	test("a user cannot update another user's address", async () => {
		const tokenA = await createUser("a@example.com");
		const tokenB = await createUser("b@example.com");

		const createRes = await request(app)
			.post("/Create-Address")
			.set("Authorization", `Bearer ${tokenA}`)
			.send({
				full_name: "A",
				phone_number: "123",
				address_line1: "1 Main St",
				city: "City",
				state: "State",
				postal_code: "00000",
				country: "Country"
			});

		const addressId = createRes.body.id;
		expect(addressId).toBeDefined();

		const updateRes = await request(app)
			.post(`/Update-Address/${addressId}`)
			.set("Authorization", `Bearer ${tokenB}`)
			.send({ full_name: "Hijacked" });

		expect(updateRes.status).toBe(403);
	});

	test("a user cannot delete another user's address", async () => {
		const tokenA = await createUser("a2@example.com");
		const tokenB = await createUser("b2@example.com");

		const createRes = await request(app)
			.post("/Create-Address")
			.set("Authorization", `Bearer ${tokenA}`)
			.send({
				full_name: "A",
				phone_number: "123",
				address_line1: "1 Main St",
				city: "City",
				state: "State",
				postal_code: "00000",
				country: "Country"
			});

		const addressId = createRes.body.id;

		const deleteRes = await request(app)
			.post(`/Delete-Address/${addressId}`)
			.set("Authorization", `Bearer ${tokenB}`)
			.send({});

		expect(deleteRes.status).toBe(403);
	});

	test("the owner can update their own address", async () => {
		const token = await createUser("address-owner-update@example.com");

		const createRes = await request(app)
			.post("/Create-Address")
			.set("Authorization", `Bearer ${token}`)
			.send({
				full_name: "A",
				phone_number: "123",
				address_line1: "1 Main St",
				city: "City",
				state: "State",
				postal_code: "00000",
				country: "Country"
			});
		const addressId = createRes.body.id;

		const updateRes = await request(app)
			.post(`/Update-Address/${addressId}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ full_name: "Updated Name" });

		expect(updateRes.status).toBe(200);
	});

	test("the owner can delete their own address", async () => {
		const token = await createUser("address-owner-delete@example.com");

		const createRes = await request(app)
			.post("/Create-Address")
			.set("Authorization", `Bearer ${token}`)
			.send({
				full_name: "A",
				phone_number: "123",
				address_line1: "1 Main St",
				city: "City",
				state: "State",
				postal_code: "00000",
				country: "Country"
			});
		const addressId = createRes.body.id;

		const deleteRes = await request(app)
			.post(`/Delete-Address/${addressId}`)
			.set("Authorization", `Bearer ${token}`)
			.send({});

		expect(deleteRes.status).toBe(200);
	});
});
