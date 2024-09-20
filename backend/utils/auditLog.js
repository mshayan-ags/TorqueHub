const { AuditLog } = require("../models/AuditLog");

// Fire-and-forget: recording an audit entry must never block or fail the
// mutation it's describing. Callers do not (and should not) await this.
function logAction({ adminId, action, targetType, targetId, summary }) {
	AuditLog.create({
		Admin: adminId,
		action,
		targetType,
		targetId,
		summary
	}).catch((err) => {
		console.error("[audit] failed to record action:", err?.message);
	});
}

module.exports = { logAction };
