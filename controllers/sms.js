const User = require('../models/user')
const Vonage = require('@vonage/server-sdk')
const { errorHandler } = require('../helpers/errorHandler')

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
})

exports.sendNotificationSMS = (req, res) => {
  console.log('---SEND SMS---')
  let { phone, title, text, code } = req.msg
  if (!phone) {
    console.log('---NO PHONE PROVIDED---')
  } else {
    const from = 'ZenMetic'
    const to = '84' + phone.slice(1)
    text = code ? ` Your CODE: ${code}` : ''

    vonage.message.sendSms(from, to, text, (err, responseData) => {
      if (err) {
        console.log('---SEND SMS FAILED---: ', err)
      } else {
        if (responseData.messages[0]['status'] === '0') {
          console.log('---SEND SMS SUCCESSFULLY---')
        } else {
          console.log(
            `---SEND SMS FAILED---: ${responseData.messages[0]['status']}`
          )
        }
      }
    })
  }
}

exports.sendConfirmationSMS = (req, res) => {
  console.log('---SEND SMS---')
  if (req.user.phone) {
    if (req.user.isPhoneActive) {
      return res.status(400).json({
        error: 'User phone number is confirmed'
      })
    }

    vonage.verify.request(
      {
        number: '84' + req.user.phone.slice(1),
        brand: 'ZENMETIC'
      },
      (err, result) => {
        if (err) {
          console.log('---SEND SMS FAILED---: ', err)
          return res.status(500).json({
            error: 'Send SMS failed'
          })
        } else {
          User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { phone_code: result.request_id } },
            { new: true }
          )
            .exec()
            .then((user) => {
              if (!user) {
                console.log('---SEND SMS FAILED---')
                return res.status(500).json({
                  error: 'User not found'
                })
              }

              console.log('---SEND SMS SUCCESSFULLY---')
              return res.json({
                success: 'Send SMS successfully'
              })
            })
            .catch((error) => {
              console.log('---SEND SMS FAILED---')
              return res.status(500).json({
                error: errorHandler(error)
              })
            })
        }
      }
    )
  } else {
    console.log('---NO PHONE PROVIDED---')
    return res.status(400).json({
      error: 'No phone provided!'
    })
  }
}

exports.verifySMS = (req, res) => {
  if (req.user.phone_code && req.params.phoneCode) {
    vonage.verify.check(
      {
        request_id: req.user.phone_code,
        code: req.params.phoneCode
      },
      (err, result) => {
        if (err) {
          console.error(err)
          return res.status(500).json({
            error: 'Send SMS failed'
          })
        } else {
          console.log('---RESULT VERIFY SMS---: ', result)

          User.findOneAndUpdate(
            { _id: req.user._id },
            {
              $set: { isPhoneActive: true },
              $unset: { phone_code: '' }
            }
          )
            .exec()
            .then((user) => {
              if (!user) {
                return res.status(500).json({
                  error: 'User not found'
                })
              }

              return res.json({
                success: 'Confirm SMS successfully'
              })
            })
            .catch((error) => {
              return res.status(500).json({
                error: errorHandler(error)
              })
            })
        }
      }
    )
  } else {
    return res.status(400).json({
      error: 'Phone code is invalid'
    })
  }
}
