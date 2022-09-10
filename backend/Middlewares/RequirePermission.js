const { Admin } = require("../models/Admin");
const { getAdminId } = require("../utils/AuthCheck");

// Pragmatic, small permission set — not trying to model every action in the
// app, just the handful of clusters that matter for who-can-do-what across
// the admin panel.
const PERMISSION_KEYS = ["manageProducts", "manageOrders", "manageUsers", "manageAdmins", "manageContent"];

// Gates a route on a specific entry in Admin.Responsiblities (a Mongoose Map).
// Runs its own getAdminId check so it can be used standalone in front of a
// route handler, ahead of (or instead of) that handler's own getAdminId call.
function requirePermission(key) {
	if (!PERMISSION_KEYS.includes(key)) {
		throw new Error(`Unknown permission key: ${key}`);
	}

	return async (req, res, next) => {
		const { id, message } = await getAdminId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message || "Not authenticated" });
		}

		const admin = await Admin.findOne({ _id: id });
		const granted = admin?.Responsiblities?.get?.(key) === true;

		if (!granted) {
			return res.status(403).json({ status: 403, message: `Missing permission: ${key}` });
		}

		req.adminId = id;
		next();
	};
}

module.exports = { requirePermission, PERMISSION_KEYS };
