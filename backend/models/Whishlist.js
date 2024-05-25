const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		product: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Product"
		}
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

WishlistSchema.index({ user: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", WishlistSchema);

module.exports = Wishlist;
