const mongoose = require("mongoose");
const { Sale } = require("../models/Sale");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { createSaleFromOrder } = require("../utils/orderFulfillment");
const { authLimiter } = require("../Middlewares/RateLimiters");

const router = Router();

function getIo() {
	// Lazily required to avoid a circular require at module-load time
	// (Server.js -> Routes.js -> Sale.js -> Server.js).
	return require("../Middlewares/Server").io;
}

router.post("/Create-Sale", async (req, res) => {
	try {

		const { id, message } = await getUserId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				["Product", "Address", "paymentMethod"],
				res
			);
			if (Check) {
				return;
			}

			try {
				const { sale } = await createSaleFromOrder(Credentials, id);
				getIo().to("admins").emit("new-sale", {
					id: sale?._id,
					totalAmount: sale?.totalAmountAfterDiscount,
					status: sale?.status
				});
				return res.status(200).json({
					status: 200,
					message: "Sale Created Successfully",
					id: sale?._id
				});
			} catch (fulfillmentError) {
				return res.status(500).json({
					status: 500,
					message: fulfillmentError?.message || "Something Went Wrong"
				});
			}
		} else {
			return res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		if (error.code == 11000) {
			return res.status(500).json({
				status: 500,
				message: `Please Change your ${Object.keys(error.keyValue)[0]} as it's not unique`
			});
		} else {
			return res.status(500).json({ status: 500, message: error.message });
		}
	}
});

router.post("/Update-Sale/:id", async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["id"], res);
			if (Check) {
				return;
			}
			const searchSale = await Sale.findOne({ _id: req?.params?.id });
			if (searchSale?._id) {
				const updateSale = {
					status: Credentials?.status || searchSale?.status,
					trackingDetails: {
						carrier: Credentials?.trackingDetails?.carrier || searchSale?.trackingDetails?.carrier,
						trackingNumber: Credentials?.trackingDetails?.trackingNumber || searchSale?.trackingDetails?.trackingNumber,
						estimatedDeliveryDate: Credentials?.trackingDetails?.estimatedDeliveryDate || searchSale?.trackingDetails?.estimatedDeliveryDate,
						currentLocation: Credentials?.trackingDetails?.currentLocation || searchSale?.trackingDetails?.currentLocation,
						lastUpdated: Credentials?.trackingDetails?.lastUpdated || searchSale?.trackingDetails?.lastUpdated,
						deliveryAttempts: Credentials?.trackingDetails?.deliveryAttempts || searchSale?.trackingDetails?.deliveryAttempts,
						comments: Credentials?.trackingDetails?.comments || searchSale?.trackingDetails?.comments,
					}
				};

				const saveSale = await Sale.updateOne(
					{
						_id: req?.params?.id
					},
					updateSale,
					{
						new: false
					}
				);

				if (saveSale?.acknowledged) {
					getIo().to(`order:${req?.params?.id}`).emit("order-update", {
						id: req?.params?.id,
						status: updateSale.status,
						trackingDetails: updateSale.trackingDetails
					});
					res.status(200).json({
						status: 200,
						message: "Sale Updated in Succesfully"
					});
				} else {
					res.status(500).json({ status: 500, message: "Something Went Wrong" });
				}
			} else {
				res.status(401).json({ status: 401, message: "Please Check Your Data" });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		if (error?.code == 11000) {
			res.status(500).json({
				status: 500,
				message: `Please Change your ${Object.keys(error?.keyValue)[0]} as it's not unique`
			});
		} else {
			res.status(500).json({ status: 500, message: error });
		}
	}
});

router.get("/SaleInfo/:id", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);
		if (id) {
			const Check = await CheckAllRequiredFieldsAvailaible(req.params, ["id"], res);
			if (Check) {
				return;
			}

			Sale.findOne({ _id: req.params.id, User: id })
				.populate(["User", "Address", { path: "Product", populate: [{ path: "product", populate: ["images"] }] }])
				.then((data) => {
					if (!data) {
						return res.status(404).json({ status: 404, message: "Sale Not Found" });
					}
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		console.log(error)
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/SaleInfoAdmin/:id", async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (id) {
			const Check = await CheckAllRequiredFieldsAvailaible(req.params, ["id"], res);
			if (Check) {
				return;
			}

			Sale.findOne({ _id: req.params.id })
				.populate(["User", "Address", { path: "Product", populate: [{ path: "product", populate: ["images"] }] }])
				.then((data) => {
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/GetAllSale", async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);

		if (id) {
			Sale.find()
				.populate(["User", { path: "CouponRedeem", populate: ["Coupon"] }])
				.then((data) => {
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

function isoWeekKey(date) {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
	return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

router.get("/Dashboard-Stats", async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const sales = await Sale.find()
			.populate([
				"User",
				{ path: "Product", populate: { path: "product", populate: "category" } }
			])
			.sort({ created_at: -1 });

		const totalRevenue = sales.reduce((sum, s) => sum + (Number(s?.totalAmountAfterDiscount) || 0), 0);
		const totalOrders = sales.length;

		const ordersByStatus = {};
		sales.forEach((s) => {
			const key = s?.status || "Unknown";
			ordersByStatus[key] = (ordersByStatus[key] || 0) + 1;
		});

		const now = new Date();
		const dayMap = {};
		for (let i = 13; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			dayMap[d.toISOString().slice(0, 10)] = 0;
		}
		sales.forEach((s) => {
			const key = new Date(s?.created_at).toISOString().slice(0, 10);
			if (dayMap[key] !== undefined) dayMap[key] += Number(s?.totalAmountAfterDiscount) || 0;
		});
		const revenueByDay = Object.entries(dayMap).map(([date, amount]) => ({ date, amount }));

		const weekMap = {};
		sales.forEach((s) => {
			const key = isoWeekKey(new Date(s?.created_at));
			weekMap[key] = (weekMap[key] || 0) + (Number(s?.totalAmountAfterDiscount) || 0);
		});
		const revenueByWeek = Object.entries(weekMap)
			.sort(([a], [b]) => (a > b ? 1 : -1))
			.slice(-8)
			.map(([week, amount]) => ({ week, amount }));

		const categoryMap = {};
		sales.forEach((s) => {
			(s?.Product || []).forEach((sop) => {
				const categoryName = sop?.product?.category?.name || "Uncategorized";
				const lineRevenue = (Number(sop?.totalPriceAfterDiscount ?? sop?.totalPrice) || 0) * (Number(sop?.quantity) || 1);
				categoryMap[categoryName] = (categoryMap[categoryName] || 0) + lineRevenue;
			});
		});
		const revenueByCategory = Object.entries(categoryMap).map(([category, amount]) => ({ category, amount }));

		res.status(200).json({
			status: 200,
			data: {
				totalRevenue,
				totalOrders,
				ordersByStatus,
				revenueByDay,
				revenueByWeek,
				revenueByCategory,
				recentOrders: sales.slice(0, 10)
			}
		});
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/Track-Guest-Order", authLimiter, async (req, res) => {
	try {
		const { orderId, email } = req.query;
		if (!orderId || !email) {
			return res.status(400).json({ status: 400, message: "orderId and email are required" });
		}

		if (!mongoose.isValidObjectId(orderId)) {
			return res.status(404).json({ status: 404, message: "Order not found" });
		}

		const sale = await Sale.findOne({ _id: orderId })
			.populate(["User", "Address", { path: "Product", populate: [{ path: "product", populate: ["images"] }] }]);

		// A generic 404 on either a non-existent order or an email mismatch —
		// distinguishing the two would let this endpoint be used to enumerate
		// valid order IDs or confirm which email placed a given order.
		if (!sale?._id || sale?.User?.email?.toLowerCase() !== String(email).toLowerCase().trim()) {
			return res.status(404).json({ status: 404, message: "Order not found" });
		}

		res.status(200).json({ status: 200, data: sale });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/GetAllSaleUser", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);

		if (id) {
			Sale.find({
				User: id
			})
				.populate(["User"])
				.then((data) => {
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});
module.exports = router;
