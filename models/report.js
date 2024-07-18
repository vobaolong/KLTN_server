const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const reportSchema = new mongoose.Schema(
  {
    objectId: {
      type: ObjectId,
      required: true,
      refPath: 'onModel'
    },
    isStore: {
      type: Boolean,
      required: true
    },
    isProduct: {
      type: Boolean,
      required: true
    },
    isReview: {
      type: Boolean,
      default: false
    },
    reason: {
      type: String,
      required: true,
      maxLength: 100
    },
    reportBy: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    onModel: {
      type: String,
      required: true,
      enum: ['Store', 'Product', 'Review']
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Report', reportSchema)
