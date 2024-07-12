const User = require('../models/user')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const { errorHandler } = require('../helpers/errorHandler')
const { formatDate } = require('../helpers/formatDate')
const Store = require('../models/store')

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
        html: `<div style="line-height: 2.5">
                  <h1 style="color: #2266cc"><img src="https://i.imgur.com/uw3oLis.png" alt="Store Image" style="max-width: 4%; height: auto; margin-right: 10px" />${title}</h1>
									<hr/>
                  <b>Xin chào ${name},</b>
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
        console.log(user)
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
              html: `<div style="line-height: 2.5">
                    <h1 style="color: #2266cc"><img src="https://i.imgur.com/uw3oLis.png" alt="Store Image" style="max-width: 4%; height: auto; margin-right: 10px" />${title}</h1>
										<hr/>
                    <b>Xin chào ${name},</b>
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

exports.sendActiveStoreEmail = async (req, res) => {
  console.log('Send active store email')
  const user = await User.findById({ _id: req.params.userId })
  const store = await Store.findById({ _id: req.params.storeId })
  const time = formatDate(Date.now())
  const title = 'THÔNG BÁO MỞ KHOÁ TÀI KHOẢN GIAN HÀNG'
  const text = `Chúng tôi xin trân trọng thông báo rằng tài khoản shop <strong style="color: #2266cc">${store.name}</strong> của quý khách sẽ mở khóa trở lại vào lúc: <strong>${time}</strong>.<br/>Chúng tôi rất xin lỗi vì sự bất tiện mà việc đóng cửa đã gây ra và chân thành cảm ơn sự kiên nhẫn và sự ủng hộ của quý khách hàng trong thời gian qua.<br/>Mong rằng sau quá trình mở khóa, chúng tôi sẽ tiếp tục nhận được sự ủng hộ và hợp tác từ phía quý khách hàng. <br/>Mọi thắc mắc hoặc yêu cầu hỗ trợ, vui lòng liên hệ với chúng tôi qua email bên dưới.`
  if (!user) {
    return res.status(400).json({ error: 'User information is missing' })
  }
  const name = user.firstName + ' ' + user.lastName
  const email = user.email
  transport
    .sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: `Zenpii E-commerce - ${title}`,
      html: `<div style="line-height: 2.5">
          <h1 style="color: #2266cc"><img src="https://i.imgur.com/uw3oLis.png" alt="Store Image" style="max-width: 4%; height: auto; margin-right: 10px" />${title}</h1>
					<hr/>
          <b>Xin chào ${name},</b>
          <p>Cảm ơn bạn đã lựa chọn Zenpii.</p>
          <p style="fontSize:30px">${text}</p>
          <p>Trân trọng,</p>
          <i>Đội ngũ hỗ trợ khách hàng</i>
          <p>Email: <a href="mailto:baolong01.dev@gmail.com">baolong01.dev@gmail.com</a></p>
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

exports.sendBanStoreEmail = async (req, res) => {
  console.log('Send ban store email')
  const user = await User.findById({ _id: req.params.userId })
  const store = await Store.findById({ _id: req.params.storeId })
  const time = formatDate(Date.now())
  const title = 'THÔNG BÁO KHOÁ TÀI KHOẢN GIAN HÀNG'
  const text = `Chúng tôi xin thông báo rằng tài khoản shop <strong style="color: #2266cc">${store.name}</strong> của bạn đã bị khoá vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết và hướng dẫn để khôi phục tài khoản của bạn.`
  if (!user) {
    return res.status(400).json({ error: 'User information is missing' })
  }
  const name = user.firstName + ' ' + user.lastName
  const email = user.email
  transport
    .sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: `Zenpii E-commerce - ${title}`,
      html: `<div style="line-height: 2.5">
          <h1 style="color: #2266cc"><img src="https://i.imgur.com/uw3oLis.png" alt="Store Image" style="max-width: 4%; height: auto; margin-right: 10px" />${title}</h1>
					<hr/>
          <b>Xin chào ${name},</b>
          <p>Cảm ơn bạn đã lựa chọn Zenpii.</p>
          <span>${text}</span>
          <p>Trân trọng,</p>
          <i>Đội ngũ hỗ trợ khách hàng</i>
          <p>Email: <a href="mailto:baolong01.dev@gmail.com">baolong01.dev@gmail.com</a></p>
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

exports.sendCreateStoreEmail = async (req, res) => {
  console.log('Send create store email')
  const user = await User.findById({ _id: req.params.userId })
  const store = await Store.findById({ _id: req.params.storeId })
  const title = 'THÔNG BÁO MỞ GIAN HÀNG THÀNH CÔNG'
  const text = `Chúng tôi xin trân trọng thông báo rằng gian hàng <strong style="color: #2266cc">${store.name}</strong> của Quý khách đã được mở thành công trên hệ thống của chúng tôi.<br/>Đội ngũ hỗ trợ của chúng tôi sẽ liên hệ với Quý khách trong thời gian sớm nhất để hướng dẫn và hỗ trợ trong quá trình vận hành gian hàng.<br/>
	<br/>
	Chúng tôi rất mong gian hàng của Quý khách sẽ đem lại nhiều cơ hội kinh doanh thành công trên nền tảng của chúng tôi.`
  if (!user) {
    return res.status(400).json({ error: 'User information is missing' })
  }
  const name = user.firstName + ' ' + user.lastName
  const email = user.email
  transport
    .sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: `Zenpii E-commerce - ${title}`,
      html: `<div style="line-height: 2.5">
           <h1 style="color: #2266cc"><img src="https://i.imgur.com/uw3oLis.png" alt="Store Image" style="max-width: 4%; height: auto; margin-right: 10px" />${title}</h1>
					<hr/>
          <b>Xin chào ${name},</b>
          <p>Cảm ơn bạn đã lựa chọn Zenpii.</p>
          <span>${text}</span>
          <p>Trân trọng,</p>
          <i>Đội ngũ hỗ trợ khách hàng</i>
          <p>Email: <a href="mailto:baolong01.dev@gmail.com">baolong01.dev@gmail.com</a></p>
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

exports.sendActiveProductEmail = async (req, res) => {
  console.log('Send active product email')
  const user = await User.findById({ _id: req.params.userId })
  const time = formatDate(Date.now())
  const title = 'THÔNG BÁO MỞ KHOÁ SẢN PHẨM'
  const text = `Chúng tôi xin trân trọng thông báo rằng sản phẩm của cửa hàng sẽ mở khóa trở lại vào lúc: <strong>${time}</strong>.<br/>Chúng tôi rất xin lỗi vì sự bất tiện mà việc khoá sản phẩm đã gây ra và chân thành cảm ơn sự kiên nhẫn và sự ủng hộ của quý khách hàng trong thời gian qua.<br/>Mong rằng sau quá trình mở khóa, chúng tôi sẽ tiếp tục nhận được sự ủng hộ và hợp tác từ phía quý khách hàng. <br/>Mọi thắc mắc hoặc yêu cầu hỗ trợ, vui lòng liên hệ với chúng tôi qua email bên dưới.`
  if (!user) {
    return res.status(400).json({ error: 'User information is missing' })
  }
  const name = user.firstName + ' ' + user.lastName
  const email = user.email
  transport
    .sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: `Zenpii E-commerce - ${title}`,
      html: `<div style="line-height: 2.5">
          <h1 style="color: #2266cc"><img src="https://i.imgur.com/uw3oLis.png" alt="Store Image" style="max-width: 4%; height: auto; margin-right: 10px" />${title}</h1>
          <b>Xin chào ${name},</b>
          <p>Cảm ơn bạn đã lựa chọn Zenpii.</p>
          <p>${text}</p>
          <p>Trân trọng,</p>
          <i>Đội ngũ hỗ trợ khách hàng</i>
          <p>Email: <a href="mailto:baolong01.dev@gmail.com">baolong01.dev@gmail.com</a></p>
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

exports.sendBanProductEmail = async (req, res) => {
  console.log('Send ban product email')
  const user = await User.findById({ _id: req.params.userId })
  const time = formatDate(Date.now())
  const title = 'THÔNG BÁO KHOÁ SẢN PHẨM'
  const text = `Chúng tôi xin thông báo rằng sản phẩm của shop đã bị khoá vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết và hướng dẫn để khôi phục tài khoản của bạn.`
  if (!user) {
    return res.status(400).json({ error: 'User information is missing' })
  }
  const name = user.firstName + ' ' + user.lastName
  const email = user.email
  transport
    .sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: `Zenpii E-commerce - ${title}`,
      html: `<div style="line-height: 2.5">
          <h1 style="color: #2266cc"><img src="https://i.imgur.com/uw3oLis.png" alt="Store Image" style="max-width: 4%; height: auto; margin-right: 10px" />${title}</h1>
					<hr/>
          <b>Xin chào ${name},</b>
          <p>Cảm ơn bạn đã lựa chọn Zenpii.</p>
          <p>${text}</p>
          <p>Trân trọng,</p>
          <i>Đội ngũ hỗ trợ khách hàng</i>
          <p>Email: <a href="mailto:baolong01.dev@gmail.com">baolong01.dev@gmail.com</a></p>
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

exports.sendReportStoreEmail = async (req, res) => {
  console.log('Send report shop email')
  const user = await User.findById({ _id: req.params.userId })
  const store = await Store.findById({ _id: req.params.storeId })
  const time = formatDate(Date.now())
  const title = 'BÁO CÁO GIAN HÀNG'
  const text = `Chúng tôi xin thông báo rằng tài khoản shop <strong style="color: #2266cc">${store.name}</strong> của bạn đã bị báo cáo vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết`
  if (!user) {
    return res.status(400).json({ error: 'User information is missing' })
  }
  const name = user.firstName + ' ' + user.lastName
  const email = user.email
  transport
    .sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: `Zenpii E-commerce - ${title}`,
      html: `<div style="line-height: 2.5">
          <h1 style="color: #2266cc"><img src="https://i.imgur.com/uw3oLis.png" alt="Store Image" style="max-width: 4%; height: auto; margin-right: 10px" />${title}</h1>
					<hr/>
          <b>Xin chào ${name},</b>
          <p>Cảm ơn bạn đã lựa chọn Zenpii.</p>
          <p>${text}</p>
          <p>Trân trọng,</p>
          <i>Đội ngũ hỗ trợ khách hàng</i>
          <p>Email: <a href="mailto:baolong01.dev@gmail.com">baolong01.dev@gmail.com</a></p>

        </div>`
    })
    .then(() => {
      console.log('Send email successfully')
    })
    .catch((error) => {
      console.log('Send email failed', error)
    })
}

exports.sendReportProductEmail = async (req, res) => {
  console.log('Send report product email')
  const user = await User.findById({ _id: req.params.userId })
  const time = formatDate(Date.now())
  const title = 'BÁO CÁO SẢN PHẨM'
  const text = `Chúng tôi xin thông báo rằng sản phẩm shop của bạn đã bị báo cáo vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết`
  if (!user) {
    return res.status(400).json({ error: 'User information is missing' })
  }
  const name = user.firstName + ' ' + user.lastName
  const email = user.email
  transport
    .sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: `Zenpii E-commerce - ${title}`,
      html: `<div style="line-height: 2.5">
          <h1 style="color: #2266cc"><img src="https://i.imgur.com/uw3oLis.png" alt="Store Image" style="max-width: 4%; height: auto; margin-right: 10px" />${title}</h1>
					<hr/>
          <b>Xin chào ${name},</b>
          <p>Cảm ơn bạn đã lựa chọn Zenpii.</p>
          <p>${text}</p>
          <p>Trân trọng,</p>
          <i>Đội ngũ hỗ trợ khách hàng</i>
          <p>Email: <a href="mailto:baolong01.dev@gmail.com">baolong01.dev@gmail.com</a></p>

        </div>`
    })
    .then(() => {
      console.log('Send email successfully')
    })
    .catch((error) => {
      console.log('Send email failed', error)
    })
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
