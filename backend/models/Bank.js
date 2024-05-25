const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema(
	{
		User: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		Sale: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Sale"
		},
		bank_name: {
			type: String,
			required: true
		},
		account_number: {
			type: String,
			required: true
		},
		account_detail: {
			type: String,
			required: true,
			unique: true
		},
		country: {
			type: String,
			required: true
		},
		stripeID: {
			type: String,
			required: true,
			unique: true
		},
		is_default: {
			type: Boolean,
			default: false
		},
		is_verified: {
			type: Boolean,
			default: false
		},
		isArchive: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: {
			createdAt: "created_at", // Use `created_at` to store the created date
			updatedAt: "updated_at" // and `updated_at` to store the last updated date
		}
	}
);

BankSchema.index({ User: 1, isArchive: 1 });

const Bank = mongoose.model("Bank", BankSchema);

module.exports = { Bank };
