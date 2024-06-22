const { Bank } = require("../models/Bank");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { getStripeClient } = require("../Middlewares/Db");
const { Address } = require("../models/Address");
const { PendingSale } = require("../models/PendingSale");

const router = Router();

async function CreateBank(Credentials) {
	try {
		const searchUser = await User.findOne({ _id: Credentials?.User });
		if (searchUser?._id) {
			const newBank = new Bank({
				bank_name: Credentials?.bank_name,
				account_number: Credentials?.account_number,
				stripeID: Credentials?.stripeID,
				country: Credentials?.country,
				is_verified: Credentials?.is_verified,
				is_default: Credentials?.is_default,
				account_detail: Credentials?.account_detail,
				isArchive: false,
				User: new mongoose.Types.ObjectId(Credentials?.User)
			});

			const saveBank = await newBank.save();

			const searchUserBankes = await Bank.find({ User: Credentials?.User }).select("_id");
			const updateUser = await User.updateOne(
				{ _id: Credentials?.User },
				{
					Bank: searchUserBankes
				},
				{
					new: false
				}
			);

			if (saveBank?._id && updateUser?.acknowledged) {
				return { id: saveBank?._id }
			} else {
				console.log("1")
				return false
			}
		} else {
			console.log("2")

			return false
		}
	}
	catch (error) {
		console.log(error)
		return false
	}
}

router.post('/create-payment-intent', async (req, res) => {
	try {

		const { id, message } = await getUserId(req);

		if (id) {
			const stripe = await getStripeClient();
			const { amount, currency } = req.body;
			const Check = await CheckAllRequiredFieldsAvailaible(
				req.body,
				[
					"amount",
					"currency",
				],
				res
			);
			if (Check) {
				return;
			}

			const searchUser = async () => { return await User.findOne({ _id: id }) };
			const user = await searchUser()

			async function CheckUser() {
				if (!user?.stripeID || user?.stripeID == "" || user?.stripeID == user?.name) {
					const customer = await stripe.customers.create({
						email: user?.email,
						name: user?.name,
					});
					const updateUser = await User.updateOne(
						{ _id: id },
						{
							stripeID: customer?.id
						},
						{
							new: false
						}
					);
					return updateUser?.acknowledged
				}
			}
			async function CreateIntent(count) {
				CheckUser();
				const stripeId = (await searchUser())?.stripeID
				const findcustomer = await stripe.customers.retrieve(stripeId).catch((err) => {
					user.stripeID = undefined
					CheckUser();
				});
				if (stripeId && stripeId != "" && findcustomer?.id) {
					try {
						const paymentIntent = await stripe.paymentIntents.create({
							"amount": amount,
							"currency": currency,
							customer: stripeId
						});

						if (req.body?.orderPayload) {
							await PendingSale.create({
								User: id,
								stripePaymentIntentId: paymentIntent.id,
								orderPayload: req.body.orderPayload
							}).catch((err) => console.error("Failed to record PendingSale:", err));
						}

						res.status(200).json(paymentIntent);
					} catch (error) {
						res.status(500).json({ error: 'An error occurred while creating the payment intent.' });
					}
				} else if (!findcustomer?.id) {
					CheckUser();
				}
				else if (count > 3) {
					CreateIntent(count + 1)
				} else {
					res.status(500).json({ error: 'An error occurred while creating the payment intent.' });
				}
			}

			CreateIntent(0)
		}
		else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		console.error('Error creating payment intent:', error.message);
		res.status(500).json({ error: 'An error occurred while creating the payment intent.' });
	}
});

router.post('/confirm-payment-intent', async (req, res) => {
	try {

		const { id, message } = await getUserId(req);

		if (id) {
			const stripe = await getStripeClient();
			const Check = await CheckAllRequiredFieldsAvailaible(
				req.body,
				[
					"intent",
					"paymentMethod",
				],
				res
			);
			if (Check) {
				return;
			}
			const {
				intent,
				paymentMethod
			} = req.body;
			const searchUser = async () => { return await User.findOne({ _id: id }) };
			const user = await searchUser();
			const searchBank = async () => {
				return await Bank.findOne({
					account_detail: `${paymentMethod?.card?.brand}_${paymentMethod?.card?.last4}`,
					User: id
				})
			};
			const getBank = await searchBank()

			if (user?.stripeID && (!getBank?.id || getBank?.id == "")) {
				const paymentMethodSave = await stripe.paymentMethods.attach(
					paymentMethod?.id,
					{
						customer: user?.stripeID,
					}
				);
				if (paymentMethodSave) {
					const Bank = {
						"bank_name": paymentMethodSave?.card?.brand,
						"account_number": paymentMethodSave?.card?.last4,
						"country": paymentMethodSave?.card?.country,
						"stripeID": paymentMethodSave?.id,
						"is_verified": true,
						"account_detail": `${paymentMethodSave?.card?.brand}_${paymentMethodSave?.card?.last4}`,
						"User": id
					}
					const checkBank = await CreateBank(Bank)
					if (checkBank?.id) {
						const method = searchBank()?.stripeID || paymentMethod?.id || 'pm_card_visa'
						const paymentIntent = await stripe.paymentIntents.confirm(intent, {
							payment_method: method,
							return_url: 'https://www.example.com',
						});
						res.status(200).json({ clientSecret: paymentIntent.client_secret, bankId: searchBank()?.id });
					} else {
						res.status(500).json({ error: 'An error occurred while confirming the payment intent.' });
					}
				}
			} else {
				const method = searchBank()?.stripeID || paymentMethod?.id || 'pm_card_visa'
				const paymentIntent = await stripe.paymentIntents.confirm(intent, {
					payment_method: method,
					return_url: 'https://www.example.com',
				});
				res.status(200).json({ clientSecret: paymentIntent.client_secret, bankId: searchBank()?.id });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		console.log(error)
		res.status(500).json({ error: 'An error occurred while confirming the payment intent.' });
	}
});

router.post("/Create-Bank", async (req, res) => {
	try {

		const { id, message } = await getUserId(req);

		if (id) {
			const Credentials = req.body;
			Credentials.User = id;
			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				[
					"bank_name",
					"account_number",
					"is_verified",
					"User"
				],
				res
			);
			if (Check) {
				return;
			}
			const created = await CreateBank(Credentials);
			if (created?.id) {
				res.status(200).json({
					status: 200,
					message: "Bank Created in Succesfully",
					id: created?.id
				});
			} else {
				res.status(500).json({ status: 500, message: "Something Went Wrong" });
			}
		}
		else {
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

router.post("/Update-Bank/:id", async (req, res) => {
	try {

		const { id, message } = await getUserId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["id"], res);
			if (Check) {
				return;
			}
			const searchUser = await User.findOne({ _id: id });
			const searchBank = await Bank.findOne({ _id: req?.params?.id });
			if (searchBank?.User?.toString() !== id) {
				return res.status(403).json({ status: 403, message: "Forbidden" });
			}
			if (searchUser?._id && searchBank?._id) {
				const updateBank = {
					bank_name: Credentials?.bank_name || searchBank?.bank_name,
					account_number: Credentials?.account_number || searchBank?.account_number,
					account_type: Credentials?.account_type || searchBank?.account_type,
					routing_number: Credentials?.routing_number || searchBank?.routing_number,
					holder_name: Credentials?.holder_name || searchBank?.holder_name,
					is_verified: Credentials?.is_verified || searchBank?.is_verified,
					is_default: Credentials?.is_default || searchBank?.is_default
				};

				const saveBank = await Bank.updateOne(
					{
						_id: req?.params?.id
					},
					updateBank,
					{
						new: false
					}
				);

				const searchUserBankes = await Bank.find({ User: id }).select("_id");
				const updateUser = await User.updateOne(
					{ _id: id },
					{
						Bank: searchUserBankes
					},
					{
						new: false
					}
				);

				if (saveBank?._id && updateUser?.acknowledged) {
					res.status(200).json({
						status: 200,
						message: "Bank Updated in Succesfully"
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

router.post("/Delete-Bank/:id", async (req, res) => {
	try {

		const { id, message } = await getUserId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["id"], res);
			if (Check) {
				return;
			}
			const searchUser = await User.findOne({ _id: id });
			const searchBank = await Bank.findOne({ _id: req?.params?.id });
			if (searchBank?.User?.toString() !== id) {
				return res.status(403).json({ status: 403, message: "Forbidden" });
			}
			if (searchUser?._id && searchBank?._id) {
				const updateBank = {
					isArchive: true
				};

				const saveBank = await Bank.updateOne(
					{
						_id: req?.params?.id
					},
					updateBank,
					{
						new: false
					}
				);

				const searchUserBankes = await Bank.find({ User: id }).select("_id");
				const updateUser = await User.updateOne(
					{ _id: id },
					{
						Bank: searchUserBankes
					},
					{
						new: false
					}
				);

				if (saveBank?._id && updateUser?.acknowledged) {
					res.status(200).json({
						status: 200,
						message: "Bank Deleted in Succesfully"
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

router.get("/BankInfo/:id", async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		const { id: userId, message: userMessage } = await getUserId(req);
		if (id || userId) {
			const Check = await CheckAllRequiredFieldsAvailaible(req.params, ["id"], res);
			if (Check) {
				return;
			}

			Bank.findOne({ _id: req.params.id })
				.populate(["User"])
				.then((data) => {
					if (!id && data?.User?._id?.toString() !== userId) {
						return res.status(403).json({ status: 403, message: "Forbidden" });
					}
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: message || userMessage });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/GetAllBanks", async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);

		if (id) {
			Bank.find()
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

router.get("/GetAllBankUser", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);

		if (id) {
			Bank.find({
				User: id,
				isArchive: false
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
