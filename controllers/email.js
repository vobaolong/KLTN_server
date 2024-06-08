const User = require('../models/user')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const { errorHandler } = require('../helpers/errorHandler')

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD
  }
})

exports.sendChangePasswordEmail = (req, res, next) => {
  console.log('Send email to change password')
  const { email, phone, name, title, text, code } = req.msg
  if (!email && phone) {
    next()
  } else if (!email && !phone) {
    console.log('No email provided')
  } else {
    transport
      .sendMail({
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: `Zenpii E-commerce - ${title}`,
        html: `<div>
                    <h2>Zenpii!</h2>
                    <h1>${title}</h1>
                    <p>Xin chào ${name},</p>
                    <p>Cảm ơn bạn đã lựa chọn Zenpii.</p>
                    <p>${text}</p>
                    ${
                      code
                        ? `<button style="background-color:#0d6efd; border:none; border-radius:4px; padding:0;">
                            <a
                                style="color:#fff; text-decoration:none; font-size:16px; padding: 16px 32px; display: inline-block;"
                                href='http://localhost:${process.env.CLIENT_PORT_2}/change/password/${code}'
                            >
                            Thay đổi mật khẩu!
                            </a>
                        </button>
                        `
                        : ''
                    }
                </div>`
      })
      .then(() => {
        console.log('Send email successfully')
      })
      .catch((error) => {
        console.log('Send email failed', error)
      })
  }
}

// Allow less secure apps to access account
exports.sendConfirmationEmail = (req, res) => {
  console.log('Send confirmed email')
  if (req.user.email) {
    if (req.user.isEmailActive) {
      return res.status(400).json({
        error: 'Email Verified'
      })
    }

    const email_code = jwt.sign(
      { email: req.body.email },
      process.env.JWT_EMAIL_CONFIRM_SECRET
    )

    User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { email_code: email_code } },
      { new: true }
    )
      .exec()
      .then((user) => {
        if (!user) {
          return res.status(500).json({
            error: 'User not found'
          })
        } else {
          const title = 'Xác minh địa chỉ email của bạn'
          const text =
            'Để có quyền truy cập vào tài khoản của bạn, vui lòng xác minh địa chỉ email của bạn bằng cách nhấp vào liên kết bên dưới.'
          const name = user.firstName + ' ' + user.lastName
          const email = req.user.email

          transport
            .sendMail({
              from: process.env.ADMIN_EMAIL,
              to: email,
              subject: `Zenpii E-commerce - ${title}`,
              html: `<div>
                    <h2>Zenpii!</h2>
                    <h1>${title}</h1>
                    <p>Xin chào, ${name},</p>
                    <p>Cảm ơn bạn đã lựa chọn Zenpii.</p>
                    <p>${text}</p>
                    <button style="background-color:#0d6efd; border:none; border-radius:4px; padding:0;">
                        <a
                            style="color:#fff; text-decoration:none; font-size:16px; padding: 16px 32px; display: inline-block;"
                            href='http://localhost:${process.env.CLIENT_PORT_2}/verify/email/${email_code}'
                        >
                       	Xác thực ngay!
                        </a>
                    </button>
                    </div>`
            })
            .then(() => {
              console.log('Send email successfully')
              return res.json({
                success: 'Send email successfully'
              })
            })
            .catch((error) => {
              console.log('Send email failed', error)
              return res.status(500).json({
                error: 'Send email failed'
              })
            })
        }
      })
      .catch((error) => {
        console.log('Send email failed', error)
        return res.status(500).json({
          error: 'Send email failed'
        })
      })
  } else {
    console.log('No email provided')
    return res.status(400).json({
      error: 'No email provided'
    })
  }
}

exports.verifyEmail = (req, res) => {
  User.findOneAndUpdate(
    { email_code: req.params.emailCode },
    { $set: { isEmailActive: true }, $unset: { email_code: '' } }
  )
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(500).json({
          error: 'User not found'
        })
      }

      return res.json({
        success: 'Confirm email successfully'
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: errorHandler(error)
      })
    })
}
