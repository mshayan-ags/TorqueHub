const mongoose = require('mongoose');

const couponRedeemSchema = new mongoose.Schema({
  Coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  Sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
  },
  user_coupon: {
    type: String,
    required: true,
    unique: true
  },
  coupon_sale: {
    type: String,
    required: false,
    unique: false
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: "created_at", // Use `created_at` to store the created date
    updatedAt: "updated_at" // and `updated_at` to store the last updated date
  }
});

couponRedeemSchema.index({ User: 1 });
couponRedeemSchema.index({ Coupon: 1 });

const CouponRedeem = mongoose.model('CouponRedeem', couponRedeemSchema);

module.exports = { CouponRedeem };
