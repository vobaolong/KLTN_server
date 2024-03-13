const mongoose = require('mongoose')
const crypto = require('crypto')
const { v4: uuid_v4 } = require('uuid')
const slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
      validate: [nameAvailable, 'Name is invalid']
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
      validate: [nameAvailable, 'Name is invalid']
    },
    slug: {
      type: String,
      slug: ['firstName', 'lastName'],
      unique: true
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    isEmailActive: {
      type: Boolean,
      default: false
    },
    email_code: {
      type: String
    },
    isPhoneActive: {
      type: Boolean,
      default: false
    },
    phone_code: {
      type: String
    },
    id_card: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    salt: String,
    hashed_password: {
      type: String
    },
    forgot_password_code: {
      type: String
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin']
    },
    addresses: {
      type: [
        {
          type: String,
          trim: true,
          maxLength: 200,
          validate: [addressesLimit, 'The limit is 6 addresses']
        }
      ],
      default: []
    },
    avatar: {
      type: String,
      default: '/uploads/default.jpg'
    },
    cover: {
      type: String,
      default: '/uploads/default.jpg'
    },
    e_wallet: {
      type: mongoose.Decimal128,
      min: 0,
      default: 0
    },
    point: {
      type: Number,
      default: 0
    },
    googleId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    facebookId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

//virtual field
userSchema
  .virtual('password')
  .set(function (password) {
    this._password = password
    this.salt = uuid_v4()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function () {
    return this._password
  })

//methods
userSchema.methods = {
  encryptPassword: function (password, salt = this.salt) {
    if (!password) return ''

    try {
      return crypto.createHmac('sha1', salt).update(password).digest('hex')
    } catch (err) {
      return ''
    }
  },
  authenticate: function (plaintext) {
    return this.encryptPassword(plaintext) === this.hashed_password
  }
}

//validators
function addressesLimit(val) {
  return val.length <= 10
}

function nameAvailable(val) {
  const regex = [/g[o0][o0]d[^\w]*deal/i]

  let flag = true
  regex.forEach((regex) => {
    if (regex.test(val)) {
      flag = false
    }
  })

  return flag
}

module.exports = mongoose.model('User', userSchema)
