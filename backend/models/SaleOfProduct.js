const mongoose = require("mongoose");

const SaleOfProductSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true
		},
		Discount: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Discount"
		},
		Sale: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Sale"
		},
		quantity: {
			type: Number,
			required: true,
			min: 1
		},
		totalPrice: {
			type: Number,
			required: true,
			min: 0
		},
		totalPriceAfterDiscount: {
			type: Number,
			required: true,
			min: 0
		}
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

const SaleOfProduct = mongoose.model("SaleOfProduct", SaleOfProductSchema);

module.exports = {SaleOfProduct};
