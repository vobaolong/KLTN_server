const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const userFollowProductSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'User'
    },
    productId: {
      type: ObjectId,
      ref: 'Product'
    },
    isDeleted: {
      type: Boolean
    }
  },
  { timestamps: true }
)

userFollowProductSchema.index({ userId: 1, productId: 1 }, { unique: true })

module.exports = mongoose.model('UserFollowProduct', userFollowProductSchema)
