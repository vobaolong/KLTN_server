const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const returnSchema = new mongoose.Schema(
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
      required: true,
      maxLength: 100
    },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Approved', 'Rejected']
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Return', returnSchema)
