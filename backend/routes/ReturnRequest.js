const { Router } = require("express");
const { ReturnRequest } = require("../models/ReturnRequest");
const { Sale } = require("../models/Sale");
const { getUserId } = require("../utils/AuthCheck");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { logAction } = require("../utils/auditLog");
const { requirePermission } = require("../Middlewares/RequirePermission");

const router = Router();

const RETURN_STATUSES = ["Requested", "Approved", "Rejected", "Refunded"];

router.post("/Create-Return-Request", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const Credentials = req.body;
		const Check = await CheckAllRequiredFieldsAvailaible(Credentials, ["Sale", "SaleOfProduct", "reason"], res);
		if (Check) {
			return;
		}

		const sale = await Sale.findOne({ _id: Credentials?.Sale, User: id });
		if (!sale?._id) {
			return res.status(404).json({ status: 404, message: "Order not found" });
		}
		if (sale?.status !== "Delivered") {
			return res.status(400).json({ status: 400, message: "Only delivered orders are eligible for returns" });
		}
		if (!sale?.Product?.some((sopId) => sopId.toString() === Credentials?.SaleOfProduct)) {
			return res.status(400).json({ status: 400, message: "That item is not part of this order" });
		}

		const existing = await ReturnRequest.findOne({ SaleOfProduct: Credentials?.SaleOfProduct });
		if (existing?._id) {
			return res.status(400).json({ status: 400, message: "A return has already been requested for this item" });
		}

		const returnRequest = await ReturnRequest.create({
			Sale: Credentials?.Sale,
			SaleOfProduct: Credentials?.SaleOfProduct,
			User: id,
			reason: Credentials?.reason
		});

		res.status(200).json({ status: 200, message: "Return request submitted", id: returnRequest?._id });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/GetReturnRequestsUser", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const data = await ReturnRequest.find({ User: id })
			.populate([{ path: "SaleOfProduct", populate: { path: "product" } }])
			.sort({ created_at: -1 });
		res.status(200).json({ status: 200, data });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/GetAllReturnRequest", requirePermission("manageOrders"), async (req, res) => {
	try {
		const data = await ReturnRequest.find()
			.populate(["User", { path: "SaleOfProduct", populate: { path: "product" } }])
			.sort({ created_at: -1 });
		res.status(200).json({ status: 200, data });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Update-Return-Status/:id", requirePermission("manageOrders"), async (req, res) => {
	try {
		const Check = await CheckAllRequiredFieldsAvailaible(req.params, ["id"], res);
		if (Check) {
			return;
		}

		const status = req.body?.status;
		if (!RETURN_STATUSES.includes(status)) {
			return res.status(400).json({ status: 400, message: "Invalid status" });
		}

		const returnRequest = await ReturnRequest.findOne({ _id: req.params.id });
		if (!returnRequest?._id) {
			return res.status(404).json({ status: 404, message: "Return request not found" });
		}

		await ReturnRequest.updateOne(
			{ _id: req.params.id },
			{ status, adminNotes: req.body?.adminNotes ?? returnRequest?.adminNotes },
			{ new: false }
		);

		logAction({
			adminId: req.adminId,
			action: "Update-Return-Status",
			targetType: "ReturnRequest",
			targetId: returnRequest?._id,
			summary: `Set return request ${returnRequest?._id} status to "${status}"`
		});

		res.status(200).json({ status: 200, message: "Return request updated" });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

module.exports = router;
