const mongoose = require("mongoose");

const PendingSaleSchema = new mongoose.Schema(
	{
		User: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		stripePaymentIntentId: {
			type: String,
			required: true,
			unique: true
		},
		orderPayload: {
			type: mongoose.Schema.Types.Mixed
		},
		status: {
			type: String,
			enum: ["Pending", "Completed", "Failed"],
			default: "Pending"
		},
		Sale: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Sale"
		}
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

const PendingSale = mongoose.model("PendingSale", PendingSaleSchema);

module.exports = { PendingSale };
