const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
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
		full_name: {
			type: String,
			required: true
		},
		phone_number: {
			type: String,
			required: true
		},
		address_line1: {
			type: String,
			required: true
		},
		address_line2: {
			type: String
		},
		city: {
			type: String,
			required: true
		},
		state: {
			type: String,
			required: true
		},
		postal_code: {
			type: String,
			required: true
		},
		country: {
			type: String,
			required: true
		},
		is_default: {
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
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

AddressSchema.index({ User: 1, isArchive: 1 });

const Address = mongoose.model("Address", AddressSchema);

module.exports = { Address };
