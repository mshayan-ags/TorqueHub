const mongoose = require('mongoose')

const DiscountSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Brand', 'Category', 'Product'],
      required: true,
    },
    targetType: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'type',
    },
    Product: {
      type: [mongoose.Schema.Types.ObjectId],
      refPath: 'Product',
    },
    SaleOfProduct: {
      type: [mongoose.Schema.Types.ObjectId],
      refPath: 'SaleOfProduct',
    },
    DiscountType: {
      type: String,
      enum: ['Percentage', 'FixedAmount'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    Admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

const Discount = mongoose.model('Discount', DiscountSchema)

module.exports = { Discount }
