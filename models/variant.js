const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32
    },
    categoryIds: {
      type: [
        {
          type: ObjectId,
          ref: 'Category'
        }
      ],
      default: [],
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Variant', variantSchema)
