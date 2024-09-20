const { Router } = require("express");
const { AuditLog } = require("../models/AuditLog");
const { requirePermission } = require("../Middlewares/RequirePermission");

const router = Router();

// Gated behind manageAdmins: an audit log of admin actions is itself
// admin-oversight data, the same trust tier as managing admins.
router.get("/GetAllAuditLog", requirePermission("manageAdmins"), async (req, res) => {
	try {
		const logs = await AuditLog.find()
			.populate(["Admin"])
			.sort({ created_at: -1 })
			.limit(500);

		res.status(200).json({ status: 200, data: logs });
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

module.exports = router;
