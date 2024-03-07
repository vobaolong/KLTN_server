const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    productId: {
      type: ObjectId,
      ref: 'Product',
      required: true
    },
    storeId: {
      type: ObjectId,
      ref: 'Store',
      required: true
    },
    orderId: {
      type: ObjectId,
      ref: 'Order',
      required: true
    },
    content: {
      type: String,
      trim: true,
      maxLength: 1000
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  { timestamps: true }
)

reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true })

module.exports = mongoose.model('Review', reviewSchema)
