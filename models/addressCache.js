const mongoose = require('mongoose')

const addressCacheSchema = new mongoose.Schema(
  {
    provinceID: {
      type: String,
      required: true
    },
    provinceName: {
      type: String
    },
    districtID: {
      type: String,
      required: true
    },
    districtName: {
      type: String
    },
    wardID: {
      type: String,
      required: true
    },
    wardName: {
      type: String
    },
    address: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('AddressCache', addressCacheSchema)
