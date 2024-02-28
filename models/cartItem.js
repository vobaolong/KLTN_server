const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const cartItemSchema = new mongoose.Schema(
  {
    cartId: {
      type: ObjectId,
      ref: 'Cart',
      required: true
    },
    productId: {
      type: ObjectId,
      ref: 'Product',
      required: true
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
      default: 1,
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('CartItem', cartItemSchema)
