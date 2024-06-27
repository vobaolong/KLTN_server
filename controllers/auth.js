const User = require('../models/user')
const RefreshToken = require('../models/refreshToken')
const jwt = require('jsonwebtoken')
const { errorHandler } = require('../helpers/errorHandler')

exports.signup = (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body
  const user = new User({ firstName, lastName, email, phone, password })
  user.save((error, user) => {
    if (error || !user) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Signing up successfully, you can sign in now'
    })
  })
}

exports.signin = (req, res, next) => {
  const { email, phone, password } = req.body

  User.findOne({
    $or: [
      {
        email: { $exists: true, $ne: null, $eq: email },
        googleId: { $exists: false, $eq: null }
      },
      {
        phone: { $exists: true, $ne: null, $eq: phone },
        googleId: { $exists: false, $eq: null }
      }
    ]
  })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        })
      }

      if (!user.authenticate(password)) {
        return res.status(401).json({
          error: "Password doesn't match"
        })
      }

      //create token
      req.auth = user
      next()
    })
    .catch((error) => {
      res.status(404).json({
        error: 'User not found'
      })
    })
}

exports.createToken = (req, res) => {
  const user = req.auth

  const accessToken = jwt.sign(
    { _id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '48h' }
  )

  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '9999 days' }
  )

  const token = new RefreshToken({ jwt: refreshToken })
  token.save((error, t) => {
    if (error) {
      return res.status(500).json({
        error: 'Create JWT failed, please try sign in again'
      })
    }

    return res.json({
      success: 'Sign in successfully',
      accessToken,
      refreshToken,
      _id: user._id,
      role: user.role
    })
  })
}

exports.signout = (req, res) => {
  const refreshToken = req.body.refreshToken

  if (refreshToken == null)
    return res.status(401).json({ error: 'refreshToken is required' })

  RefreshToken.deleteOne({ jwt: refreshToken })
    .exec()
    .then(() => {
      return res.json({
        success: 'Sign out successfully'
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Sign out and remove refresh token failed'
      })
    })
}

exports.refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken

  if (refreshToken == null)
    return res.status(401).json({ error: 'refreshToken is required' })

  RefreshToken.findOne({ jwt: refreshToken })
    .exec()
    .then((token) => {
      if (!token) {
        return res.status(404).json({
          error: 'refreshToken is invalid'
        })
      } else {
        const decoded = jwt.decode(token.jwt)

        const accessToken = jwt.sign(
          { _id: decoded._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '48h' }
        )

        const newRefreshToken = jwt.sign(
          { _id: decoded._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '9999 days' }
        )

        RefreshToken.findOneAndUpdate(
          { jwt: refreshToken },
          { $set: { jwt: newRefreshToken } }
        )
          .exec()
          .then((t) => {
            if (!t) {
              return res.status(500).json({
                error: 'Create JWT failed, try again later'
              })
            }

            return res.json({
              success: 'Refresh token successfully',
              accessToken,
              refreshToken: newRefreshToken
            })
          })
          .catch((error) => {
            return res.status(500).json({
              error: 'Create JWT failed,try again later'
            })
          })
      }
    })
    .catch((error) => {
      return res.status(401).json({
        error: 'refreshToken is invalid'
      })
    })
}

exports.forgotPassword = (req, res, next) => {
  const { email, phone } = req.body

  const forgot_password_code = jwt.sign(
    { email, phone },
    process.env.JWT_FORGOT_PASSWORD_SECRET
  )

  User.findOneAndUpdate(
    {
      $or: [
        { email: { $exists: true, $ne: null, $eq: email } },
        { phone: { $exists: true, $ne: null, $eq: phone } }
      ]
    },
    { $set: { forgot_password_code } },
    { new: true }
  )
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        })
      }

      //send email or phone
      const msg = {
        email: email ? email : '',
        phone: phone ? phone : '',
        name: user.firstName + ' ' + user.lastName,
        title: 'Request to change password',
        text: 'Please click on the following link to change your password.',
        code: forgot_password_code
      }
      req.msg = msg
      next()

      return res.json({
        success: 'Request successfully, waiting for email or sms'
      })
    })
    .catch((error) => {
      return res.status(404).json({
        error: 'User not found'
      })
    })
}

exports.changePassword = (req, res) => {
  const forgot_password_code = req.params.forgotPasswordCode
  const { password } = req.body

  User.findOneAndUpdate(
    { forgot_password_code: forgot_password_code },
    { $unset: { forgot_password_code: '' } }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        })
      }

      user.hashed_password = user.encryptPassword(password, user.salt)
      user.save((e, u) => {
        if (e) {
          return res.status(500).json({
            error: 'Update password failed, Please request to resend mail/sms'
          })
        }
        return res.json({
          success: 'Update password successfully'
        })
      })
    })
    .catch((error) => {
      return res.status(404).json({
        error: 'User not found'
      })
    })
}

exports.authSocial = (req, res, next) => {
  const { googleId } = req.body

  if (!googleId)
    return res.status(400).json({
      error: 'googleId is required'
    })

  User.findOne({
    $or: [{ googleId: { $exists: true, $ne: null, $eq: googleId } }]
  })
    .exec()
    .then((user) => {
      if (!user) {
        next()
      } else {
        req.auth = user
        next()
      }
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Signing in with Google failed'
      })
    })
}

exports.authUpdate = (req, res, next) => {
  if (req.auth) next()
  else {
    const { firstName, lastName, email, googleId } = req.body

    if (googleId) {
      User.findOneAndUpdate(
        { email: { $exists: true, $ne: null } },
        { $set: { googleId } },
        { new: true }
      )
        .exec()
        .then((user) => {
          if (!user) {
            const newUser = new User({
              firstName,
              lastName,
              email,
              googleId,
              isEmailActive: true
            })
            newUser.save((error, u) => {
              if (error) {
                return res.status(400).json({
                  error: errorHandler(error)
                })
              }
              req.auth = u
              next()
            })
          } else {
            req.auth = user
            next()
          }
        })
        .catch((error) => {
          next()
        })
    }
  }
}

//check current password
exports.verifyPassword = (req, res, next) => {
  const { currentPassword } = req.body
  User.findById(req.user._id, (error, user) => {
    if (error || !user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }
    if (user.googleId) {
      return next() // Bỏ qua bước xác thực mật khẩu
    }
    if (!user.authenticate(currentPassword)) {
      return res.status(401).json({
        error: "Current password doesn't match"
      })
    } else next()
  })
}

exports.isAuth = (req, res, next) => {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(' ')[1]
  ) {
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).json({
          error: 'Unauthorized! Please sign in again'
        })
      }

      if (req.user._id == decoded._id) {
        next()
      } else {
        return res.status(403).json({
          error: 'Access denied'
        })
      }
    })
  } else {
    return res.status(401).json({
      error: 'No token provided! Please sign in again'
    })
  }
}

//owner and staff of store
exports.isManager = (req, res, next) => {
  if (
    !req.user._id.equals(req.store.ownerId) &&
    req.store.staffIds.indexOf(req.user._id) == -1
  ) {
    return res.status(403).json({
      error: 'Store Manager resource! Access denied',
      isManager: false
    })
  }
  next()
}

exports.isOwner = (req, res, next) => {
  if (!req.user._id.equals(req.store.ownerId)) {
    return res.status(403).json({
      error: 'Store Owner resource! Access denied',
      isOwner: false
    })
  } else next()
}

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin resource! Access denied'
    })
  }
  next()
}
