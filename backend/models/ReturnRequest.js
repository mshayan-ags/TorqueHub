const mongoose = require("mongoose");

const ReturnRequestSchema = new mongoose.Schema(
	{
		Sale: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Sale",
			required: true
		},
		SaleOfProduct: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "SaleOfProduct",
			required: true
		},
		User: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		reason: {
			type: String,
			required: true,
			trim: true
		},
		status: {
			type: String,
			enum: ["Requested", "Approved", "Rejected", "Refunded"],
			default: "Requested"
		},
		// Refunds stay a status label in this first cut — no automatic Stripe
		// refund call is triggered by setting status to "Refunded". That's a
		// deliberate scope boundary, not an oversight.
		adminNotes: {
			type: String,
			trim: true
		}
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

ReturnRequestSchema.index({ User: 1 });
ReturnRequestSchema.index({ Sale: 1 });
ReturnRequestSchema.index({ status: 1 });

const ReturnRequest = mongoose.model("ReturnRequest", ReturnRequestSchema);

module.exports = { ReturnRequest };
