const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const reportSchema = new mongoose.Schema(
  {
    objectId: {
      type: String,
      required: true
    },
    isStore: {
      type: Boolean,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    reportBy: {
      type: ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)
module.exports = mongoose.model('Report', reportSchema)
