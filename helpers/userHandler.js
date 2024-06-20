exports.cleanUser = (user) => {
  if (user.email_code) user.email_code = undefined
  if (user.phone_code) user.phone_code = undefined
  if (user.forgot_password_code) user.forgot_password_code = undefined
  user.salt = undefined
  user.hashed_password = undefined

  user.isEmailActive = undefined
  user.isPhoneActive = undefined
  user.addresses = undefined
  user.e_wallet = undefined

  if (user.email) user.email = user.email.slice(0, 6) + '******'
  if (user.phone) user.phone = '*******' + user.phone.slice(-3)
  if (user.id_card) user.id_card = user.id_card.slice(0, 3) + '******'

  return user
}

exports.cleanUserLess = (user) => {
  if (user.email_code) user.email_code = undefined
  if (user.phone_code) user.phone_code = undefined
  if (user.forgot_password_code) user.forgot_password_code = undefined
  user.salt = undefined
  user.hashed_password = undefined

  return user
}
