const mongoose = require('mongoose')

const addressesSchema = new mongoose.Schema({
  address: {
    type: String,
    trim: true,
    required: true
  },
  addressType: {
    type: String,
    enum: ['office', 'home'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
})

addressesSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    )
  }
  next()
})
function addressesLimit(val) {
  return val.length <= 10
}
module.exports = mongoose.model('Addresses', addressesSchema)
