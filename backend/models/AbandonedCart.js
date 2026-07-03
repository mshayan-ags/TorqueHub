const mongoose = require("mongoose");

// One doc per logged-in user — guest carts are explicitly out of scope,
// since guests have no known identity (email) until checkout.
const AbandonedCartSchema = new mongoose.Schema(
	{
		User: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true
		},
		items: {
			type: [
				{
					ProductID: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
					quantity: { type: Number, default: 1 }
				}
			],
			default: []
		},
		lastUpdated: {
			type: Date,
			default: Date.now
		},
		// Cleared back to null whenever the cart is synced again, so a fresh
		// wave of inactivity after a reminder can trigger another one.
		reminderSentAt: {
			type: Date,
			default: null
		}
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

AbandonedCartSchema.index({ lastUpdated: 1, reminderSentAt: 1 });

const AbandonedCart = mongoose.model("AbandonedCart", AbandonedCartSchema);

module.exports = { AbandonedCart };
