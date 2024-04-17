const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    storeId: {
      type: ObjectId,
      ref: 'Store',
      required: true
    },
    deliveryId: {
      type: ObjectId,
      ref: 'Delivery',
      required: true
    },
    commissionId: {
      type: ObjectId,
      ref: 'Commission',
      required: true
    },
    status: {
      type: String,
      default: 'Not processed',
      enum: ['Not processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    amountFromUser: {
      type: mongoose.Decimal128,
      required: true,
      min: 0
    },
    amountFromStore: {
      type: mongoose.Decimal128,
      required: true,
      min: 0
    },
    amountToStore: {
      type: mongoose.Decimal128,
      required: true,
      min: 0
    },
    amountToZenpii: {
      type: mongoose.Decimal128,
      required: true,
      min: 0
    },
    isPaidBefore: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)
