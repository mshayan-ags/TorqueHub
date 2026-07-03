const { Router } = require("express");
const { AbandonedCart } = require("../models/AbandonedCart");
const { getUserId } = require("../utils/AuthCheck");

const router = Router();

// Debounced calls from Frontend/src/context/Cart.js whenever the logged-in
// user's cart changes. An empty items array means the cart was cleared
// (checked out or emptied) — the record is removed rather than kept as a
// stale "abandoned" cart with nothing in it.
router.post("/Sync-Cart", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const items = Array.isArray(req.body?.items) ? req.body.items : [];
		const normalizedItems = items
			.filter((i) => i?.ProductID)
			.map((i) => ({ ProductID: i.ProductID, quantity: Number(i?.quantity) || 1 }));

		if (normalizedItems.length === 0) {
			await AbandonedCart.deleteOne({ User: id });
			return res.status(200).json({ status: 200, message: "Cart synced" });
		}

		await AbandonedCart.updateOne(
			{ User: id },
			{ User: id, items: normalizedItems, lastUpdated: new Date(), reminderSentAt: null },
			{ upsert: true }
		);

		res.status(200).json({ status: 200, message: "Cart synced" });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

module.exports = router;
