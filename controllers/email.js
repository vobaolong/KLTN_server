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
  console.log('---SEND CHANGE PASSWORD EMAIL---')
  const { email, phone, name, title, text, code } = req.msg
  if (!email && phone) {
    next()
  } else if (!email && !phone) {
    console.log('---NO EMAIL PROVIDED---')
  } else {
    transport
      .sendMail({
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: `ZenMetic Ecommerce - ${title}`,
        html: `<div>
                    <h2>ZENMETIC!</h2>
                    <h1>${title}</h1>
                    <p>Hi ${name},</p>
                    <p>Thank you for choosing ZenMetic.</p>
                    <p>${text}</p>
                    ${
                      code
                        ? `<button style="background-color:#0d6efd; border:none; border-radius:4px; padding:0;">
                            <a
                                style="color:#fff; text-decoration:none; font-size:16px; padding: 16px 32px; display: inline-block;"
                                href='http://localhost:${process.env.CLIENT_PORT_2}/change/password/${code}'
                            >
                            Change password!
                            </a>
                        </button>
                        `
                        : ''
                    }
                </div>`
      })
      .then(() => {
        console.log('---SEND EMAIL SUCCESSFULLY---')
      })
      .catch((error) => {
        console.log('---SEND EMAIL FAILED---', error)
      })
  }
}

// Allow less secure apps to access account
exports.sendConfirmationEmail = (req, res) => {
  console.log('---SEND CONFIRMED EMAIL---')
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
          const title = 'Verify your email address'
          const text =
            'To get access to your account please verify your email address by clicking the link below.'
          const name = user.firstName + ' ' + user.lastName
          const email = req.user.email

          transport
            .sendMail({
              from: process.env.ADMIN_EMAIL,
              to: email,
              subject: `ZenMetic Ecommerce - ${title}`,
              html: `<div>
                    <h2>ZENMETIC!</h2>
                    <h1>${title}</h1>
                    <p>Hi ${name},</p>
                    <p>Thank you for choosing ZenMetic.</p>
                    <p>${text}</p>
                    <button style="background-color:#0d6efd; border:none; border-radius:4px; padding:0;">
                        <a
                            style="color:#fff; text-decoration:none; font-size:16px; padding: 16px 32px; display: inline-block;"
                            href='http://localhost:${process.env.CLIENT_PORT_2}/verify/email/${email_code}'
                        >
                        Verify now!
                        </a>
                    </button>
                    </div>`
            })
            .then(() => {
              console.log('---SEND EMAIL SUCCESSFULLY---')
              return res.json({
                success: 'Send email successfully'
              })
            })
            .catch((error) => {
              console.log('---SEND EMAIL FAILED---', error)
              return res.status(500).json({
                error: 'Send email failed'
              })
            })
        }
      })
      .catch((error) => {
        console.log('---SEND EMAIL FAILED---', error)
        return res.status(500).json({
          error: 'Send email failed'
        })
      })
  } else {
    console.log('---NO EMAIL PROVIDED---')
    return res.status(400).json({
      error: 'No email provided!'
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
