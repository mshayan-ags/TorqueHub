const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
	{
		User: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		Discount: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Discount"
		},
		Product: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "SaleOfProduct"
		},
		Address: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Address",
			required: true
		},
		// Not required: card payments via Stripe Elements (the storefront's
		// only real payment path) never carry a saved Bank record — orderPayload
		// explicitly sends Bank: null for these, and orderFulfillment.js already
		// treats a missing Bank as valid (Bank: searchBank?._id ? ... : undefined).
		// This field being required here meant every card-payment Sale — created
		// from the Stripe webhook — failed Mongoose validation and was silently
		// never created, even though Stripe had already charged the customer.
		Bank: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Bank"
		},
		Review: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Review"
		},
		CouponRedeem: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "CouponRedeem"
		},
		totalAmount: {
			type: Number,
			required: true,
			min: 0
		},
		totalAmountAfterDiscount: {
			type: Number,
			required: true,
			min: 0
		},
		couponvalue: {
			type: Number,
			required: true,
			min: 0
		},
		paymentMethod: {
			type: String,
			required: true
		},
		status: {
			type: String,
			enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Scheduled"],
			default: "Pending"
		},
		trackingDetails: {
			carrier: {
				type: String
			},
			trackingNumber: {
				type: String
			},
			estimatedDeliveryDate: {
				type: Date
			},
			currentLocation: {
				type: String
			},
			lastUpdated: {
				type: Date,
				default: Date.now
			},
			deliveryAttempts: {
				type: Number,
				default: 0
			},
			comments: {
				type: String
			}
		},
		deliveryDate: {
			type: Date
		},
		scheduleDate: {
			type: Date
		},
		Notes: {
			type: String
		},
		stripePaymentIntentId: {
			type: String,
			index: true,
			sparse: true
		}

	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

SaleSchema.index({ User: 1 });
SaleSchema.index({ status: 1 });
SaleSchema.index({ Address: 1 });
SaleSchema.index({ Bank: 1 });

const Sale = mongoose.model("Sale", SaleSchema);

module.exports = { Sale };
