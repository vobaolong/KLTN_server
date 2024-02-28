const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: ObjectId,
      ref: 'Order'
    },
    productId: {
      type: ObjectId,
      ref: 'Product'
    },
    styleValueIds: {
      type: [
        {
          type: ObjectId,
          ref: 'StyleValue'
        }
      ],
      default: []
    },
    count: {
      type: Number,
      min: 1,
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('OrderItem', orderItemSchema)
