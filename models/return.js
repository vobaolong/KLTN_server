const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const refundSchema = new mongoose.Schema(
  {
    orderId: {
      type: ObjectId,
      ref: 'Order',
      required: true
    },
    userId: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Approved', 'Rejected', 'Processed']
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Refund', refundSchema)
