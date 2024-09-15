const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { APP_SECRET } = require("../utils/AuthCheck");
const { verifyAzureAdToken } = require("../utils/verifyAzureAdToken");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { authLimiter } = require("../Middlewares/RateLimiters");

const router = Router();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const AZURE_B2C_TENANT_NAME = process.env.AZURE_B2C_TENANT_NAME;
const AZURE_B2C_TENANT_ID = process.env.AZURE_B2C_TENANT_ID;
const AZURE_B2C_POLICY_NAME = process.env.AZURE_B2C_POLICY_NAME;
const AZURE_B2C_CLIENT_ID = process.env.AZURE_B2C_CLIENT_ID;

// Additive to /Login, not a replacement — customers sign in with any
// Microsoft/social account through an Azure AD B2C user-flow policy. Unlike
// AdminSSO, a first-time sign-in here auto-creates the User: this is
// customer self-service, not a privileged account.
router.post("/Login/SSO", authLimiter, async (req, res) => {
	try {
		if (!AZURE_B2C_TENANT_NAME || !AZURE_B2C_TENANT_ID || !AZURE_B2C_POLICY_NAME || !AZURE_B2C_CLIENT_ID) {
			return res.status(500).json({ status: 500, message: "Storefront SSO is not configured" });
		}

		const Check = await CheckAllRequiredFieldsAvailaible(req.body, ["idToken"], res);
		if (Check) {
			return;
		}

		let payload;
		try {
			payload = await verifyAzureAdToken(req.body?.idToken, {
				jwksUri: `https://${AZURE_B2C_TENANT_NAME}.b2clogin.com/${AZURE_B2C_TENANT_NAME}.onmicrosoft.com/${AZURE_B2C_POLICY_NAME}/discovery/v2.0/keys`,
				issuer: `https://${AZURE_B2C_TENANT_NAME}.b2clogin.com/${AZURE_B2C_TENANT_ID}/v2.0/`,
				audience: AZURE_B2C_CLIENT_ID,
			});
		} catch (err) {
			return res.status(401).json({ status: 401, message: "Invalid or expired Microsoft sign-in" });
		}

		const email = (payload?.emails?.[0] || payload?.email || payload?.preferred_username || "").toLowerCase();
		if (!email) {
			return res.status(401).json({ status: 401, message: "Your Microsoft account has no email claim" });
		}

		let searchUser = await User.findOne({ email });
		if (!searchUser?._id) {
			// B2C already verified this email as part of its own sign-up/sign-in
			// policy, so the new User is marked verified immediately. The random
			// password is unusable — this account can only sign in via SSO unless
			// the customer later sets one through Forget-Password.
			const randomPassword = await bcrypt.hash(
				`${Date.now()}-${Math.random().toString(36).slice(2)}`,
				15
			);
			searchUser = await new User({
				name: payload?.name || email,
				email,
				password: randomPassword,
				stripeID: `${email}-${Date.now()}`,
				isVerified: true,
			}).save();
		}

		const token = jwt.sign({ id: searchUser?._id }, APP_SECRET, { expiresIn: JWT_EXPIRES_IN });
		res.status(200).json({
			token,
			status: 200,
			message: "User Logged in Succesfully"
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

module.exports = router;
