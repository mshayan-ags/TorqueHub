const { Admin } = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticator } = require("otplib");
const qrcode = require("qrcode");
const { APP_SECRET, getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { SaveImageDB } = require("./Image");
const { default: mongoose } = require("mongoose");
const { authLimiter } = require("../Middlewares/RateLimiters");

const router = Router();

router.post("/Create-Admin", async (req, res) => {
	try {

		const Credentials = req.body;

		const Check = await CheckAllRequiredFieldsAvailaible(
			Credentials,
			["name", "email", "phoneNumber", "Role", "password"],
			res
		);
		if (Check) {
			return;
		}

		const password = await bcrypt.hash(Credentials?.password, 15);

		const newAdmin = new Admin({
			name: Credentials?.name,
			email: Credentials?.email,
			phoneNumber: Credentials?.phoneNumber,
			password: password,
			Role: Credentials?.Role
		});

		if (Credentials?.profilePicture?.name) {
			const image = await SaveImageDB(
				Credentials?.profilePicture,
				{ Admin: new mongoose.Types.ObjectId(newAdmin?._id) },
				res
			);

			if (image?.file?._id) {
				newAdmin.profilePicture = new mongoose.Types.ObjectId(image?.file?._id);
			} else {
				res.status(500).json({ status: 500, message: image?.Error });
			}
		}
		await newAdmin.save();
		const token = jwt.sign({ id: newAdmin?._id, Role: newAdmin?.Role }, APP_SECRET);

		res.status(200).json({
			token,
			status: 200,
			message: "Admin Created in Succesfully"
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

router.post("/Update-Admin", async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);
		if (id) {
			const Credentials = req.body;

			const searchAdmin = await Admin.findOne({ _id: id });

			if (searchAdmin?._id) {
				if (Credentials?.profilePicture?.name) {
					const image = await SaveImageDB(
						Credentials?.profilePicture,
						{ Admin: new mongoose.Types.ObjectId(searchAdmin?._id) },
						res
					);
					if (image?.file?._id) {
						Credentials.profilePicture = new mongoose.Types.ObjectId(image?.file?._id);
					} else {
						res.status(500).json({ status: 500, message: image?.Error });
					}
				}
				// Role is intentionally excluded: an admin must never be able to
				// self-escalate their own Role via this endpoint.
				const AllowedUpdate = {
					name: Credentials?.name ?? searchAdmin?.name,
					email: Credentials?.email ?? searchAdmin?.email,
					phoneNumber: Credentials?.phoneNumber ?? searchAdmin?.phoneNumber,
					profilePicture: Credentials?.profilePicture ?? searchAdmin?.profilePicture
				};
				await Admin.updateOne({ _id: id }, AllowedUpdate, {
					new: false
				})
					.then((docs) => {
						res.status(401).json({
							status: 200,
							message: "Your Admin has been Updated"
						});
					})
					.catch((error) => {
						res.status(500).json({ status: 500, message: error });
					});
			} else {
				res.status(500).json({ status: 500, message: "Admin Not Found" });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Login-Admin", authLimiter, async (req, res) => {
	try {

		const Credentials = req.body;

		const Check = await CheckAllRequiredFieldsAvailaible(Credentials, ["email", "password"], res);
		if (Check) {
			return;
		}

		const searchAdmin = await Admin.findOne({ email: Credentials?.email }).select("+twoFactorSecret");

		if (searchAdmin?.password && searchAdmin?._id) {
			const valid = await bcrypt.compare(Credentials?.password, searchAdmin?.password);

			if (valid) {
				if (searchAdmin?.twoFactorEnabled) {
					const pendingToken = jwt.sign(
						{ id: searchAdmin?._id, Role: searchAdmin?.Role, stage: "2fa-pending" },
						APP_SECRET,
						{ expiresIn: "5m" }
					);
					return res.status(200).json({
						status: 200,
						twoFactorRequired: true,
						pendingToken,
						message: "Enter your 2FA code"
					});
				}

				const token = jwt.sign({ id: searchAdmin?._id, Role: searchAdmin?.Role }, APP_SECRET);
				res.status(200).json({
					token,
					status: 200,
					message: "Admin Logged in Succesfully"
				});
			} else if (!valid) {
				res.status(500).json({ status: 500, message: "Your Password is incorrect" });
			} else {
				res.status(500).json({ status: 500, message: "Admin Not Verified" });
			}
		} else {
			res.status(500).json({ status: 500, message: "Admin Not Found" });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Login-Admin/Verify-2FA", authLimiter, async (req, res) => {
	try {
		const Credentials = req.body;
		const Check = await CheckAllRequiredFieldsAvailaible(Credentials, ["pendingToken", "otp"], res);
		if (Check) {
			return;
		}

		let payload;
		try {
			payload = jwt.verify(Credentials?.pendingToken, APP_SECRET);
		} catch (e) {
			return res.status(401).json({ status: 401, message: "2FA session expired, please log in again" });
		}

		if (payload?.stage !== "2fa-pending") {
			return res.status(401).json({ status: 401, message: "Invalid 2FA session" });
		}

		const searchAdmin = await Admin.findOne({ _id: payload?.id }).select("+twoFactorSecret");
		if (!searchAdmin?.twoFactorSecret) {
			return res.status(401).json({ status: 401, message: "2FA is not set up for this account" });
		}

		const valid = authenticator.verify({ token: Credentials?.otp, secret: searchAdmin?.twoFactorSecret });
		if (!valid) {
			return res.status(401).json({ status: 401, message: "Invalid 2FA code" });
		}

		const token = jwt.sign({ id: searchAdmin?._id, Role: searchAdmin?.Role }, APP_SECRET);
		res.status(200).json({
			token,
			status: 200,
			message: "Admin Logged in Succesfully"
		});
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/2FA/Setup", authLimiter, async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const searchAdmin = await Admin.findOne({ _id: id });
		const secret = authenticator.generateSecret();
		await Admin.updateOne({ _id: id }, { twoFactorSecret: secret }, { new: false });

		const otpauth = authenticator.keyuri(searchAdmin?.email, "TorqueHub Admin", secret);
		const qr = await qrcode.toDataURL(otpauth);

		res.status(200).json({ status: 200, data: { qr, otpauth } });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/2FA/Verify-Enable", authLimiter, async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const Check = await CheckAllRequiredFieldsAvailaible(req.body, ["otp"], res);
		if (Check) {
			return;
		}

		const searchAdmin = await Admin.findOne({ _id: id }).select("+twoFactorSecret");
		if (!searchAdmin?.twoFactorSecret) {
			return res.status(500).json({ status: 500, message: "Call /2FA/Setup first" });
		}

		const valid = authenticator.verify({ token: req.body?.otp, secret: searchAdmin?.twoFactorSecret });
		if (!valid) {
			return res.status(401).json({ status: 401, message: "Invalid 2FA code" });
		}

		await Admin.updateOne({ _id: id }, { twoFactorEnabled: true }, { new: false });
		res.status(200).json({ status: 200, message: "2FA enabled" });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/2FA/Disable", authLimiter, async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const Check = await CheckAllRequiredFieldsAvailaible(req.body, ["password"], res);
		if (Check) {
			return;
		}

		const searchAdmin = await Admin.findOne({ _id: id });
		const valid = await bcrypt.compare(req.body?.password, searchAdmin?.password);
		if (!valid) {
			return res.status(401).json({ status: 401, message: "Password is incorrect" });
		}

		await Admin.updateOne({ _id: id }, { twoFactorEnabled: false, twoFactorSecret: undefined }, { new: false });
		res.status(200).json({ status: 200, message: "2FA disabled" });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/AdminInfo", async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);
		if (id) {
			Admin.findOne({ _id: id })
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

router.get("/GetAdminInfo/:id", async (req, res) => {
	try {

		const { id, message } = await getAdminId(req);
		if (id) {
			Admin.findOne({ _id: req?.params?.id })
				.populate(["profilePicture"])
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

router.get("/GetAllAdmins", async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (id) {
			Admin.find()
				.populate(["profilePicture"])
				.exec()
				.then((data) => {
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					console.log(err);

					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 500, message: error });
	}
});

module.exports = router;
