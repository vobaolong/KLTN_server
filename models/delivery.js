const mongoose = require('mongoose')

const deliverySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxLength: 32
    },
    price: {
      type: mongoose.Decimal128,
      required: true,
      min: 0
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxLength: 3000
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Delivery', deliverySchema)
