const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  province: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  ward: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  }
})

addressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    )
  }
  next()
})

module.exports = mongoose.model('Address', addressSchema)
