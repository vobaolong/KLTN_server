const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const slug = require('mongoose-slug-generator')

mongoose.plugin(slug)
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      maxLength: 300
    },
    slug: {
      type: String,
      slug: 'name',
      unique: true
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxLength: 3000
    },
    price: {
      type: mongoose.Decimal128,
      required: true,
      min: 0
    },
    salePrice: {
      type: mongoose.Decimal128,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    sold: {
      type: Number,
      required: true,
      default: 0
    },
    isActive: {
      type: Boolean,
      required: true
    },
    isSelling: {
      type: Boolean,
      default: true
    },
    listImages: {
      type: [String],
      validate: [listImagesLimit, 'Limit is 7 images'],
      default: []
    },
    categoryId: {
      type: ObjectId,
      ref: 'Category',
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
    storeId: {
      required: true,
      type: ObjectId,
      ref: 'Store'
    },
    rating: {
      type: Number,
      default: 4,
      min: 0,
      max: 5
    }
  },
  { timestamps: true }
)

//validators
function listImagesLimit(val) {
  return val.length > 0 && val.length <= 6
}

module.exports = mongoose.model('Product', productSchema)
