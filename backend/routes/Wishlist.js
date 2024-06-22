const Wishlist = require("../models/Whishlist");
const { getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");

const router = Router();

router.get("/GetWishlist", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const wishlist = await Wishlist.findOne({ user: id })
			.populate([{ path: "product", populate: ["images"] }]);

		res.status(200).json({ status: 200, data: wishlist?.product || [] });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Add-To-Wishlist", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const Check = await CheckAllRequiredFieldsAvailaible(req.body, ["product"], res);
		if (Check) {
			return;
		}

		const wishlist = await Wishlist.findOneAndUpdate(
			{ user: id },
			{ $addToSet: { product: req.body?.product } },
			{ upsert: true, new: true }
		);

		res.status(200).json({ status: 200, message: "Added to Wishlist", data: wishlist });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Remove-From-Wishlist", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const Check = await CheckAllRequiredFieldsAvailaible(req.body, ["product"], res);
		if (Check) {
			return;
		}

		const wishlist = await Wishlist.findOneAndUpdate(
			{ user: id },
			{ $pull: { product: req.body?.product } },
			{ new: true }
		);

		res.status(200).json({ status: 200, message: "Removed from Wishlist", data: wishlist });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

module.exports = router;
