const { User } = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId, getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const Verifier = require("email-validator")
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { SaveImageDB } = require("./Image");
const { default: mongoose } = require("mongoose");
const { authLimiter } = require("../Middlewares/RateLimiters");

const router = Router();

router.post("/SignUp", async (req, res) => {
	try {
		const Credentials = req.body;

		const Check = await CheckAllRequiredFieldsAvailaible(
			Credentials,
			["name", "email", "password"],
			res
		);
		if (await Check) {
			return;
		} else {
			const password = await bcrypt.hash(Credentials?.password, 15);

			const newUser = new User({
				name: Credentials?.name,
				email: Credentials?.email,
				password: password,
				stripeID: Credentials?.name
			});

			if (newUser) {
				const validEmail = await Verifier.validate(newUser?.email);
				if (validEmail) {
					if (Credentials?.profilePicture?.data) {
						const image = await SaveImageDB(
							Credentials?.profilePicture,
							{ User: new mongoose.Types.ObjectId(newUser?._id) },
							res
						);

						if (image?.file?._id) {
							newUser.profilePicture = new mongoose.Types.ObjectId(image?.file?._id);
						} else {
							res.status(500).json({ status: 500, message: image?.Error });
						}
					}
					await newUser
						.save()
						.then((data) => {
							if (data?._id) {
								const token = jwt.sign({ id: newUser?._id }, APP_SECRET);

								res.status(200).json({
									token,
									id: newUser?._id,
									status: 200,
									message: "User Created in Succesfully"
								});
							}
						})
						.catch((error) => {
							if (error?.code == 11000) {
								res.status(500).json({
									status: 500,
									message: `Please Change your ${Object.keys(error?.keyValue)[0]
										} as it's not unique`
								});
								return;
							} else {
								res.status(500).json({ status: 500, message: error });
								return;
							}
						});
				} else {
					res.status(500).json({
						status: 500,
						message: `Please Change your email as it's not valid`
					});
				}
			} else {
				res.status(500).json({
					status: 500,
					message: `There was Some Issue`
				});
			}
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

router.post("/Guest-Checkout", async (req, res) => {
	try {
		const Credentials = req.body;

		const Check = await CheckAllRequiredFieldsAvailaible(
			Credentials,
			["name", "email"],
			res
		);
		if (Check) {
			return;
		}

		const searchUser = await User.findOne({ email: Credentials?.email });

		if (searchUser?._id) {
			if (!searchUser?.isGuest) {
				return res.status(500).json({
					status: 500,
					message: "An account already exists for this email. Please log in."
				});
			}

			const token = jwt.sign({ id: searchUser?._id }, APP_SECRET);
			return res.status(200).json({
				token,
				id: searchUser?._id,
				status: 200,
				message: "Continuing as guest"
			});
		}

		const randomPassword = await bcrypt.hash(
			`${Date.now()}-${Math.random().toString(36).slice(2)}`,
			15
		);

		const newGuest = new User({
			name: Credentials?.name,
			email: Credentials?.email,
			password: randomPassword,
			isGuest: true,
			stripeID: Credentials?.name
		});

		await newGuest.save();
		const token = jwt.sign({ id: newGuest?._id }, APP_SECRET);

		res.status(200).json({
			token,
			id: newGuest?._id,
			status: 200,
			message: "Guest account created"
		});
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

router.post("/Verify-OTP", authLimiter, async (req, res) => {
	try {
		const Check = await CheckAllRequiredFieldsAvailaible(req.body, ["email", "otp"], res);
		if (Check) {
			return;
		}

		const searchUser = await User.findOne({ email: req.body?.email });

		if (searchUser?._id && searchUser?.otp == req.body?.otp) {
			await User.updateOne(
				{ _id: searchUser?._id },
				{ isVerified: true },
				{
					new: false
				}
			)
				.then((docs) => {
					res.status(200).json({
						id: docs?._id,
						status: 200,
						message: "Your Account is Verified"
					});
				})
				.catch((error) => {
					res.status(500).json({ status: 500, message: error });
				});
		} else {
			res.status(401).json({ status: 401, message: "You Have Entered Wrong Otp or email" });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Forget-Password", authLimiter, async (req, res) => {
	try {
		const Check = await CheckAllRequiredFieldsAvailaible(req?.body, ["email"], res);
		if (Check) {
			return;
		}

		const searchUser = await User.findOne({ email: req.body?.email });
		if (searchUser?._id) {
			await User.updateOne(
				{ _id: searchUser?._id },
				{ isVerified: false, otp: otp, password: `${otp}` },
				{
					new: false
				}
			)
				.then((docs) => {
					res.status(200).json({
						status: 200,
						message: "An Email is sent to your id"
					});
				})
				.catch((error) => {
					console.log(error);
					res.status(500).json({ status: 500, message: error });
				});
		} else {
			res.status(401).json({ status: 401, message: "You Have Entered Wrong email" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Resend-OTP", authLimiter, async (req, res) => {
	try {
		const Check = await CheckAllRequiredFieldsAvailaible(req?.body, ["email"], res);
		if (Check) {
			return;
		}

		const searchUser = await User.findOne({ email: req.body?.email });
		if (searchUser?._id) {
			await User.updateOne(
				{ _id: searchUser?._id },
				{ isVerified: false, otp: otp },
				{
					new: false
				}
			)
				.then((docs) => {
					res.status(200).json({
						status: 200,
						message: "An Email is sent to your id"
					});
				})
				.catch((error) => {
					console.log(error);
					res.status(500).json({ status: 500, message: error });
				});
		} else {
			res.status(401).json({ status: 401, message: "You Have Entered Wrong email" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Change-Password", authLimiter, async (req, res) => {
	try {
		const Credentials = req.body;

		const Check = await CheckAllRequiredFieldsAvailaible(
			Credentials,
			["password", "email", "newPassword"],
			res
		);
		if (Check) {
			return;
		}

		const searchUser = await User.findOne({ email: Credentials?.email });
		if (searchUser?.password && searchUser?._id) {
			const valid = await bcrypt.compare(Credentials?.password, searchUser?.password);
			if (valid) {
				const password = await bcrypt.hash(Credentials?.newPassword, 15);
				await User.updateOne(
					{ _id: searchUser?._id },
					{ password: password },
					{
						new: false
					}
				)
					.then((docs) => {
						res.status(200).json({
							status: 200,
							message: "Your Password has been Changed"
						});
					})
					.catch((error) => {
						res.status(500).json({ status: 500, message: error });
					});
			} else {
				res.status(500).json({ status: 500, message: "Password Not Valid" });
			}
		} else {
			res.status(500).json({ status: 500, message: "User Not Found or wrong email" });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Update-User", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);
		if (id) {
			const Credentials = req.body;

			const searchUser = await User.findOne({ _id: id });

			if (searchUser?._id) {
				if (Credentials?.profilePicture?.name) {
					const image = await SaveImageDB(
						Credentials?.profilePicture,
						{ User: new mongoose.Types.ObjectId(searchUser?._id) },
						res
					);
					if (image?.file?._id) {
						Credentials.profilePicture = new mongoose.Types.ObjectId(image?.file?._id);
					} else {
						res.status(500).json({ status: 500, message: image?.Error });
					}
				}
				const AllowedUpdate = {
					name: Credentials?.name ?? searchUser?.name,
					email: Credentials?.email ?? searchUser?.email,
					subscriber: Credentials?.subscriber ?? searchUser?.subscriber,
					profilePicture: Credentials?.profilePicture ?? searchUser?.profilePicture
				};
				await User.updateOne({ _id: searchUser?._id }, AllowedUpdate, {
					new: false
				})
					.then((docs) => {
						res.status(200).json({
							status: 200,
							message: "Your User has been Updated"
						});
					})
					.catch((error) => {
						res.status(500).json({ status: 500, message: error });
					});
			} else {
				res.status(401).json({ status: 401, message: "User Not Found" });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Login", authLimiter, async (req, res) => {
	try {
		const Credentials = req.body;

		const Check = await CheckAllRequiredFieldsAvailaible(Credentials, ["email", "password"], res);
		if (Check) {
			return;
		}

		const searchUser = await User.findOne({ email: Credentials?.email });
		if (searchUser?.password && searchUser?._id) {
			const valid = await bcrypt.compare(Credentials?.password, searchUser?.password);
			if (valid) {
				const token = jwt.sign({ id: searchUser?._id }, APP_SECRET);
				res.status(200).json({
					token,
					status: 200,
					message: "User Logged in Succesfully"
				});
			} else if (!valid) {
				res.status(500).json({ status: 500, message: "Your Password is incorrect" });
			} else {
				res.status(500).json({ status: 500, message: "User Not Verified" });
			}
		} else {
			res.status(500).json({ status: 500, message: "User Not Found" });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/userInfo/:id", async (req, res) => {
	try {
		const { id: adminId, message: adminMessage } = await getAdminId(req);
		if (adminId) {
			User.findOne({ _id: req?.params?.id })
				.populate(["profilePicture"])
				.then((data) => {
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: adminMessage });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/GetAllUsers", async (req, res) => {
	try {
		const { id: adminId, message: adminMessage } = await getAdminId(req);
		if (adminId) {
			User.find()
				.populate(["profilePicture"])
				.then((data) => {
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: adminMessage });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/userInfo", async (req, res) => {
	try {
		const { id, message } = await getUserId(req);
		if (id) {
			User.findOne({ _id: id })
				.populate([{ path: "profilePicture" }])
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
