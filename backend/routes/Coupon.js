const { Coupon } = require("../models/Coupon");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { SaveImageDB } = require("./Image");
const { Admin } = require("../models/Admin");
const { User } = require("../models/User");
const { CouponRedeem } = require("../models/ReedemCoupon");
const { logAction } = require("../utils/auditLog");
const { requirePermission } = require("../Middlewares/RequirePermission");

const router = Router();


const evaluateRestrictions = (restriction, user) => {
	if (restriction === 'new_user') {
		return user?.Sale?.length <= 0;
	}
	if (restriction.startsWith('min_orders_')) {
		const minOrders = parseInt(restriction.split('_')[2], 10);
		return user?.Sale?.length >= minOrders;
	}
	if (restriction.startsWith('max_orders_')) {
		const maxOrders = parseInt(restriction.split('_')[2], 10);
		return user?.Sale?.length <= maxOrders;
	}

	// Points-redemption coupons (see POST /Redeem-Points) are minted
	// per-user and must never be usable by anyone else.
	if (restriction.startsWith('only_user_')) {
		const allowedUserId = restriction.replace('only_user_', '');
		return String(user?._id) === allowedUserId;
	}

	if (restriction == "true") {
		return true
	}
};

const POINTS_PER_DOLLAR = 100;
const MIN_REDEEM_POINTS = 500;



router.post("/Create-Coupon", requirePermission("manageContent"), async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				["code", "discountType", "discountValue", "minimumPurchase", "expirationDate", "restrictions"],
				res
			);
			if (Check) {
				return;
			}
			const newCoupon = new Coupon({
				code: Credentials?.code,
				discountType: Credentials?.discountType,
				discountValue: Credentials?.discountValue,
				minimumPurchase: Credentials?.minimumPurchase,
				expirationDate: Credentials?.expirationDate,
				restrictions: Credentials?.restrictions,
				isActive: true,
				Admin: new mongoose.Types.ObjectId(id)
			});

			const saveCoupon = await newCoupon.save();
			const searchAdminCoupons = await Coupon.find({ Admin: id }).select("_id");
			const updateAdmin = await Admin.updateOne(
				{ _id: id },
				{
					Coupon: searchAdminCoupons,
				},
				{ new: false }
			);
			if (saveCoupon?._id && updateAdmin?.acknowledged) {
				logAction({
					adminId: id,
					action: "Create-Coupon",
					targetType: "Coupon",
					targetId: saveCoupon?._id,
					summary: `Created coupon "${saveCoupon?.code}"`
				});
				res.status(200).json({
					status: 200,
					message: "Coupon Created in Succesfully"
				});
			} else {
				res.status(500).json({ status: 500, message: "Something Went Wrong" });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		console.log(error);
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

router.post("/Reedem-Coupon", async (req, res) => {
	try {

		const { id, message } = await getUserId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				[
					"Coupon",
					"total"
				],
				res
			);
			if (Check) {
				return;
			}

			const searchCoupon = await Coupon.findOne({ code: Credentials?.Coupon });
			const isCouponAlreadyRedeemed = await CouponRedeem.findOne({ user_coupon: `${id}_${searchCoupon?._id}` });
			const user = await User?.findOne({ _id: id })

			if (
				searchCoupon?._id
				&& (!isCouponAlreadyRedeemed?._id || isCouponAlreadyRedeemed?._id == "")
				&& (searchCoupon?.minimumPurchase < Credentials?.total)
				&& (new Date(searchCoupon?.expirationDate) > new Date())
				&& searchCoupon?.isActive
				&& evaluateRestrictions(searchCoupon?.restrictions, user)
			) {
				const newCouponRedeem = new CouponRedeem({
					User: new mongoose.Types.ObjectId(id),
					Coupon: new mongoose.Types.ObjectId(searchCoupon?._id),
					user_coupon: `${id}_${searchCoupon?._id}`
				});

				const saveCoupon = await newCouponRedeem.save();
				const searchUserCoupons = await CouponRedeem.find({ User: id }).select("_id");
				const updateUser = await User.updateOne(
					{ _id: id },
					{
						Coupon: searchUserCoupons,
					},
					{ new: false }
				);
				const searchCouponUsed = await CouponRedeem.find({ Coupon: searchCoupon?._id }).select("_id");
				const updateCoupon = await Coupon.updateOne(
					{ _id: searchCoupon?._id },
					{
						Coupon: searchCouponUsed,
					},
					{ new: false }
				);
				if (saveCoupon?._id && updateUser?.acknowledged && updateCoupon?.acknowledged) {
					res.status(200).json({
						status: 200,
						message: "Coupon Reedemed in Succesfully",
						data: searchCoupon
					});
				} else {
					res.status(500).json({ status: 500, message: "Something Went Wrong" });
				}
			} else {
				res.status(400).json({ status: 400, message: "Coupon Not Availaible For This User" });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		console.log(error);
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

router.post("/Redeem-Points", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const pointsToRedeem = Number(req.body?.points);
		if (!pointsToRedeem || pointsToRedeem < MIN_REDEEM_POINTS) {
			return res.status(400).json({ status: 400, message: `Minimum redemption is ${MIN_REDEEM_POINTS} points` });
		}

		const user = await User.findOne({ _id: id });
		if (!user?._id || user?.points < pointsToRedeem) {
			return res.status(400).json({ status: 400, message: "You don't have enough points" });
		}

		// Only whole $-per-POINTS_PER_DOLLAR units are convertible — any
		// remainder stays in the user's balance rather than being lost.
		const discountValue = Math.floor(pointsToRedeem / POINTS_PER_DOLLAR);
		const pointsSpent = discountValue * POINTS_PER_DOLLAR;

		const code = `POINTS-${id.toString().slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
		const newCoupon = new Coupon({
			code,
			discountType: "FixedAmount",
			discountValue,
			minimumPurchase: 1,
			expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			restrictions: `only_user_${id}`,
			isActive: true
		});
		await newCoupon.save();

		await User.updateOne({ _id: id }, { points: user.points - pointsSpent }, { new: false });

		res.status(200).json({
			status: 200,
			message: `Redeemed ${pointsSpent} points for a $${discountValue} coupon`,
			data: newCoupon
		});
	} catch (error) {
		if (error?.code == 11000) {
			res.status(500).json({ status: 500, message: "Please try again" });
		} else {
			res.status(500).json({ status: 500, message: error });
		}
	}
});

router.post("/Update-Coupon/:id", requirePermission("manageContent"), async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["id"], res);
			if (Check) {
				return;
			}
			const searchCoupon = await Coupon.findOne({ _id: req?.params?.id });
			if (searchCoupon?._id) {
				const updateCoupon = {
					code: Credentials?.code || searchCoupon?.code,
					discountType: Credentials?.discountType || searchCoupon?.discountType,
					discountValue: Credentials?.discountValue || searchCoupon?.discountValue,
					minimumPurchase: Credentials?.minimumPurchase || searchCoupon?.minimumPurchase,
					expirationDate: Credentials?.expirationDate || searchCoupon?.expirationDate,
					restrictions: Credentials?.restrictions || searchCoupon?.restrictions,
					isActive: Credentials?.isActive || searchCoupon?.isActive,
				};

				const saveCoupon = await Coupon.updateOne(
					{
						_id: req?.params?.id
					},
					updateCoupon,
					{
						new: false
					}
				);

				if (saveCoupon?.acknowledged) {
					res.status(200).json({
						status: 200,
						message: "Coupon Updated in Succesfully"
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
		console.log(error);
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

router.get("/CouponInfo/:id", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);

		if (id) {
			const Check = await CheckAllRequiredFieldsAvailaible(req.params, ["id"], res);
			if (Check) {
				return;
			}

			Coupon.findOne({ _id: req.params.id })
				.populate([])
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

router.get("/GetAllCoupons", async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);

		if (id) {
			Coupon.find()
				.populate([])
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

router.get("/GetAllCouponsUser", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);
		const user = await User?.findOne({ _id: id })
		if (id) {
			CouponRedeem.find({
				User: id
			})
				.populate(["Coupon"])
				.then((data) => {
					const send = data?.filter((a) => {
						const searchCoupon = a?.Coupon
						if (searchCoupon?._id
							&& (!a?.coupon_sale || a?.coupon_sale == "")
							&& evaluateRestrictions(searchCoupon?.restrictions, user)
							&& (new Date(searchCoupon?.expirationDate) > new Date())
							&& searchCoupon?.isActive) {
							return a
						}
					})
					res.status(200).json({ status: 200, data: send });
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
