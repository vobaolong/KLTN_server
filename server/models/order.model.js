const mongoose = require('mongoose')

var orderSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
      },
      count: Number,
      color: String
    }
  ],
  status: {
    type: String,
    default: 'Processing',
    enum: ['Cancelled', 'Processing', 'Succeed']
  },
  orderBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  total: Number,
  coupon: { type: mongoose.Types.ObjectId, ref: 'Coupon' }
})

module.exports = mongoose.model('Order', orderSchema)
