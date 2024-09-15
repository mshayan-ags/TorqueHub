const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { Admin } = require("../models/Admin");
const { APP_SECRET } = require("../utils/AuthCheck");
const { verifyAzureAdToken } = require("../utils/verifyAzureAdToken");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { authLimiter } = require("../Middlewares/RateLimiters");

const router = Router();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const AZURE_AD_TENANT_ID = process.env.AZURE_AD_TENANT_ID;
const AZURE_AD_ADMIN_CLIENT_ID = process.env.AZURE_AD_ADMIN_CLIENT_ID;

// Additive to /Login-Admin, not a replacement — staff sign in with their
// Microsoft work account, verified against this org's own Azure AD tenant.
// Deliberately never auto-creates an Admin: an already-permissioned admin
// must create the account via /Create-Admin first, same as the password
// flow. SSO logins also skip the app's own TOTP 2FA prompt, since Azure AD
// is expected to enforce its own Conditional Access / MFA policies upstream.
router.post("/Login-Admin/SSO", authLimiter, async (req, res) => {
	try {
		if (!AZURE_AD_TENANT_ID || !AZURE_AD_ADMIN_CLIENT_ID) {
			return res.status(500).json({ status: 500, message: "Admin SSO is not configured" });
		}

		const Check = await CheckAllRequiredFieldsAvailaible(req.body, ["idToken"], res);
		if (Check) {
			return;
		}

		let payload;
		try {
			payload = await verifyAzureAdToken(req.body?.idToken, {
				jwksUri: `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/discovery/v2.0/keys`,
				issuer: `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/v2.0`,
				audience: AZURE_AD_ADMIN_CLIENT_ID,
			});
		} catch (err) {
			return res.status(401).json({ status: 401, message: "Invalid or expired Microsoft sign-in" });
		}

		const email = (payload?.preferred_username || payload?.email || "").toLowerCase();
		if (!email) {
			return res.status(401).json({ status: 401, message: "Your Microsoft account has no email claim" });
		}

		const searchAdmin = await Admin.findOne({ email });
		if (!searchAdmin?._id) {
			return res.status(403).json({
				status: 403,
				message: "No admin account found for this Microsoft account. Ask an administrator to create one first."
			});
		}

		const token = jwt.sign({ id: searchAdmin?._id, Role: searchAdmin?.Role }, APP_SECRET, { expiresIn: JWT_EXPIRES_IN });
		res.status(200).json({
			token,
			status: 200,
			message: "Admin Logged in Succesfully"
		});
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

module.exports = router;
