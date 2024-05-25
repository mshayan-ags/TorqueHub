const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  discountType: {
    type: String,
    enum: ['Percentage', 'FixedAmount'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minimumPurchase: {
    type: Number,
    default: 0
  },
  expirationDate: {
    type: Date,
    required: true
  },
  restrictions: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  CouponRedeem: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "CouponRedeem"
  },
  Admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = { Coupon };
