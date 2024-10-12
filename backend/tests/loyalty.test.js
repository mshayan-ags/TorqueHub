require("./setup");
const request = require("supertest");
const { app } = require("../Middlewares/Server");
const { User } = require("../models/User");
const { Coupon } = require("../models/Coupon");

async function createUser(email, points = 0) {
	const res = await request(app).post("/SignUp").send({ name: email, email, password: "password123" });
	if (points) {
		await User.updateOne({ _id: res.body.id }, { points });
	}
	return { token: res.body.token, id: res.body.id };
}

describe("POST /Redeem-Points", () => {
	test("rejects redemption below the minimum threshold", async () => {
		const { token } = await createUser("low-points@example.com", 100);
		const res = await request(app)
			.post("/Redeem-Points")
			.set("Authorization", `Bearer ${token}`)
			.send({ points: 100 });
		expect(res.status).toBe(400);
	});

	test("rejects redemption exceeding the user's balance", async () => {
		const { token } = await createUser("not-enough-points@example.com", 400);
		const res = await request(app)
			.post("/Redeem-Points")
			.set("Authorization", `Bearer ${token}`)
			.send({ points: 500 });
		expect(res.status).toBe(400);
	});

	test("converts points into a real, single-use coupon and deducts the balance", async () => {
		const { token, id } = await createUser("points-redeemer@example.com", 1250);
		const res = await request(app)
			.post("/Redeem-Points")
			.set("Authorization", `Bearer ${token}`)
			.send({ points: 1200 });

		expect(res.status).toBe(200);
		expect(res.body.data.discountValue).toBe(12);
		expect(res.body.data.restrictions).toBe(`only_user_${id}`);

		const user = await User.findOne({ _id: id });
		// 1200 points redeemed exactly (12 * 100) — the extra 50 stays banked.
		expect(user.points).toBe(50);

		const coupon = await Coupon.findOne({ code: res.body.data.code });
		expect(coupon?._id).toBeDefined();
	});

	test("a points coupon can only be redeemed by the user it was minted for", async () => {
		const { token: ownerToken, id: ownerId } = await createUser("points-owner@example.com", 1000);
		const redeemRes = await request(app)
			.post("/Redeem-Points")
			.set("Authorization", `Bearer ${ownerToken}`)
			.send({ points: 1000 });
		const code = redeemRes.body.data.code;

		const { token: otherToken } = await createUser("points-stranger@example.com");
		const stolenAttempt = await request(app)
			.post("/Reedem-Coupon")
			.set("Authorization", `Bearer ${otherToken}`)
			.send({ Coupon: code, total: 100 });
		expect(stolenAttempt.status).toBe(400);

		const ownRedeem = await request(app)
			.post("/Reedem-Coupon")
			.set("Authorization", `Bearer ${ownerToken}`)
			.send({ Coupon: code, total: 100 });
		expect(ownRedeem.status).toBe(200);
	});
});
