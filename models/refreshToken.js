const mongoose = require('mongoose')

const refreshTokenSchema = new mongoose.Schema(
  {
    jwt: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('RefreshToken', refreshTokenSchema)
