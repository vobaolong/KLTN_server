const mongoose = require('mongoose')

const userLevelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxLength: 32
    },
    minPoint: {
      type: Number,
      required: true,
      unique: true,
      min: 0
    },
    discount: {
      type: mongoose.Decimal128,
      required: true,
      min: 0
    },
    color: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('UserLevel', userLevelSchema)
