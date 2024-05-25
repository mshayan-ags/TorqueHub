const mongoose = require("mongoose");

// Category Schema
const CategorySchema = new mongoose.Schema(
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

const Category = mongoose.model("Category", CategorySchema);

module.exports = { Category };
