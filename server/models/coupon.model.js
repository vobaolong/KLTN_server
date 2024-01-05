const mongoose = require('mongoose')

var couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      uppercase: true,
      required: true,
      unique: true
    },
    discount: {
      type: Number,
      required: true
    },
    expire: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
)

//Export the model
module.exports = mongoose.model('Coupon', couponSchema)
