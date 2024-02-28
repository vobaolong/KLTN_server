const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32
    },
    slug: {
      type: String,
      slug: 'name',
      unique: true
    },
    image: {
      type: String,
      trim: true,
      required: true
    },
    categoryId: {
      type: ObjectId,
      ref: 'Category',
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

categorySchema.index({ name: 1, categoryId: 1 }, { unique: true })

module.exports = mongoose.model('Category', categorySchema)
