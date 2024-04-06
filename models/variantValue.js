const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const variantValueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32
    },
    variantId: {
      type: ObjectId,
      ref: 'Variant',
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

variantValueSchema.index({ name: 1, variantId: 1 }, { unique: true })

module.exports = mongoose.model('VariantValue', variantValueSchema)
