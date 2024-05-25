const mongoose = require("mongoose");

// Brand Schema
const BrandSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			lowercase: true
		},
		description: {
			type: String
		},
		country: {
			type: String
		},
		website: {
			type: String
		},
		logo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image"
		},
		Product: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Product"
		},
		Discount: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Discount"
		}
	},
	{
		timestamps: true
	}
);

const Brand = mongoose.model("Brand", BrandSchema);

module.exports = { Brand };
