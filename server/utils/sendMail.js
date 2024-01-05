const nodemailer = require('nodemailer')
const asyncHandler = require('express-async-handler')

const sendMail = asyncHandler(async ({ email, html }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: process.env.SMPT_PORT,
    secure: false,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD
    }
  })

  const info = await transporter.sendMail({
    from: '"Cosmetic Store 💄" <no-reply@cosmeticstore.com>', // sender address
    to: email,
    subject: 'Cosmetic Store 💄 - Forgot Password / Reset', // Subject line
    text: 'Reset Password', // plain text body
    html: html // html body
  })

  return info
})

module.exports = sendMail
