// One-off migration: run this once, before deploying the admin RBAC gating
// (RequirePermission.js), against any environment that already has real
// Admin accounts. Every existing Admin document has Responsiblities:
// undefined today, and the new permission middleware denies-by-default, so
// without this every current admin loses access to gated routes the moment
// that change ships.
//
// Usage: node scripts/backfillAdminPermissions.js
require("dotenv").config();
const mongoose = require("mongoose");
const { connect } = require("../Middlewares/Db");
const { Admin } = require("../models/Admin");

const FULL_PERMISSIONS = {
	manageProducts: true,
	manageOrders: true,
	manageUsers: true,
	manageAdmins: true,
	manageContent: true,
};

async function run() {
	await connect();

	const admins = await Admin.find({});
	let updated = 0;

	for (const admin of admins) {
		if (admin.Responsiblities && admin.Responsiblities.size > 0) {
			continue; // already has explicit permissions set, don't overwrite
		}
		admin.Responsiblities = FULL_PERMISSIONS;
		await admin.save();
		updated++;
	}

	console.log(`Backfilled permissions for ${updated} of ${admins.length} admin account(s).`);
	await mongoose.disconnect();
	process.exit(0);
}

run().catch((err) => {
	console.error("Backfill failed:", err);
	process.exit(1);
});
