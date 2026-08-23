const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");

function mockRes() {
	const res = {};
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	return res;
}

describe("CheckAllRequiredFieldsAvailaible", () => {
	test("accepts a legitimate 0 for a required numeric field", async () => {
		const res = mockRes();
		const missing = await CheckAllRequiredFieldsAvailaible({ price: 0 }, ["price"], res);
		expect(missing).toBe(false);
		expect(res.status).not.toHaveBeenCalled();
	});

	test("accepts a legitimate false for a required boolean field", async () => {
		const res = mockRes();
		const missing = await CheckAllRequiredFieldsAvailaible({ is_verified: false }, ["is_verified"], res);
		expect(missing).toBe(false);
		expect(res.status).not.toHaveBeenCalled();
	});

	test("still rejects an actually missing field", async () => {
		const res = mockRes();
		const missing = await CheckAllRequiredFieldsAvailaible({}, ["name"], res);
		expect(missing).toBe(true);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ status: 500, message: "Please Fill the Required Field name" });
	});

	test("still rejects an empty string", async () => {
		const res = mockRes();
		const missing = await CheckAllRequiredFieldsAvailaible({ name: "" }, ["name"], res);
		expect(missing).toBe(true);
	});
});
