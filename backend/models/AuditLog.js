const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
	{
		Admin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin",
			required: true
		},
		action: {
			type: String,
			required: true
		},
		targetType: {
			type: String,
			required: true
		},
		targetId: {
			type: mongoose.Schema.Types.ObjectId
		},
		summary: {
			type: String
		}
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

AuditLogSchema.index({ Admin: 1 });
AuditLogSchema.index({ created_at: -1 });

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);

module.exports = { AuditLog };
