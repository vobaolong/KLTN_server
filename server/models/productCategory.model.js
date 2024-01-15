const mongoose = require('mongoose')

var productCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    brand: { type: Array, required: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('ProductCategory', productCategorySchema)
