const Review = require("../models/Review");
const { Product } = require("../models/Product");
const { Sale } = require("../models/Sale");
const { getUserId, getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { requirePermission } = require("../Middlewares/RequirePermission");

const router = Router();

router.post("/Create-Review", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const Credentials = req.body;
		const Check = await CheckAllRequiredFieldsAvailaible(
			Credentials,
			["targetType", "targetId", "rating"],
			res
		);
		if (Check) {
			return;
		}

		if (!["Product", "Sale"].includes(Credentials?.targetType)) {
			return res.status(500).json({ status: 500, message: "Invalid targetType" });
		}

		const Model = Credentials?.targetType === "Product" ? Product : Sale;
		const target = await Model.findOne({ _id: Credentials?.targetId });
		if (!target?._id) {
			return res.status(500).json({ status: 500, message: "Review target not found" });
		}

		const newReview = new Review({
			targetType: Credentials?.targetType,
			targetId: Credentials?.targetId,
			user: id,
			rating: Credentials?.rating,
			comment: Credentials?.comment,
			isApproved: false
		});

		await newReview.save();
		res.status(200).json({
			status: 200,
			message: "Review submitted and pending approval",
			id: newReview?._id
		});
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/GetApprovedReviews/:targetType/:targetId", async (req, res) => {
	try {
		Review.find({
			targetType: req.params.targetType,
			targetId: req.params.targetId,
			isApproved: true
		})
			.populate([{ path: "user", select: "name profilePicture" }])
			.sort({ created_at: -1 })
			.then((data) => {
				res.status(200).json({ status: 200, data: data });
			})
			.catch((err) => {
				res.status(500).json({ status: 500, message: err });
			});
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Approve-Review/:id", requirePermission("manageContent"), async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		await Review.updateOne({ _id: req.params.id }, { isApproved: true }, { new: false });
		res.status(200).json({ status: 200, message: "Review Approved" });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Hide-Review/:id", requirePermission("manageContent"), async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		await Review.updateOne({ _id: req.params.id }, { isApproved: false }, { new: false });
		res.status(200).json({ status: 200, message: "Review Hidden" });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/GetAllReviewsAdmin", async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		Review.find()
			.populate([{ path: "user", select: "name profilePicture" }])
			.sort({ created_at: -1 })
			.then((data) => {
				res.status(200).json({ status: 200, data: data });
			})
			.catch((err) => {
				res.status(500).json({ status: 500, message: err });
			});
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

module.exports = router;
