const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    mobile: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'user'
    },
    cart: {
      type: Array,
      default: []
    },
    address: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Address'
      }
    ],
    wishList: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
      }
    ],
    isBlocked: {
      type: Boolean,
      default: false
    },
    refreshToken: {
      type: String
    },
    passwordChangedAt: {
      type: String
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: String
    }
  },
  { timestamps: true }
)

// băm password
userSchema.pre('save', async function (next) {
  // check password không đổi thì thôi, đổi thì băm
  if (!this.isModified('password')) {
    next()
  }
  const salt = bcrypt.genSaltSync(10)
  this.password = await bcrypt.hashSync(this.password, salt)
})

// dùng hàm compare để so sánh 2 pw với nhau
userSchema.methods = {
  isCorrectPassword: async function (password) {
    return await bcrypt.compare(password, this.password)
  },
  createPasswordChangedToken: function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000
    return resetToken
  }
}

//Export model
module.exports = mongoose.model('User', userSchema)
