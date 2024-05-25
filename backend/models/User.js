const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true
		},
		points: {
			type: Number,
			default: 0,
			required: true,
		},
		stripeID: {
			type: String,
			unique: true
		},
		password: {
			type: String,
			required: function () { return !this.isGuest; },
			trim: true
		},
		subscriber: {
			type: Boolean,
			required: true,
			default: true
		},
		profilePicture: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image"
		},
		Bank: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Bank"
		},
		Address: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Address"
		},
		Whishlist: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Wishlist"
		},
		isGuest: {
			type: Boolean,
			default: false
		},
		Review: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Review"
		},
		Sale: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Sale"
		},
		CouponRedeem: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "CouponRedeem"
		},
	},
	{
		timestamps: {
			createdAt: "created_at", // Use `created_at` to store the created date
			updatedAt: "updated_at" // and `updated_at` to store the last updated date
		}
	}
);

const User = mongoose.model("User", UserSchema);

module.exports = { User };
