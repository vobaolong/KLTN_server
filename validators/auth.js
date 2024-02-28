const { check, oneOf } = require('express-validator')

const signup = () => [
  check('firstName')
    .not()
    .isEmpty()
    .withMessage('FirstName is required')
    .isLength({ max: 32 })
    .withMessage('FirstName can contain up to 32 characters')
    .matches(
      /^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\d\s_'-]*$/
    )
    .withMessage(
      "FirstName can contain numbers, some special characters such as _, ', - and space"
    )
    .custom(checkStoreName),

  check('lastName')
    .not()
    .isEmpty()
    .withMessage('LastName is required')
    .isLength({ max: 32 })
    .withMessage('LastName can contain up to 32 characters')
    .matches(
      /^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\d\s_'-]*$/
    )
    .withMessage(
      "LastName can contain numbers, some special characters such as _, ', - and space"
    )
    .custom(checkStoreName),

  oneOf(
    [
      [
        check('email').not().exists(),

        check('phone')
          .not()
          .isEmpty()
          .matches(/^\d{10,11}$/)
      ],
      [
        check('phone').not().exists(),

        check('email')
          .not()
          .isEmpty()
          .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
      ]
    ],
    'Email or phone number must be provided at least one (email must contain @ and phone number must contain 10 or 11 numbers)'
  ),

  check('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
    .withMessage(
      'Password must contain at least 6 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character such as @, $, !, %, *, ?, &'
    )
]

const signin = () => [
  oneOf(
    [
      [
        check('email').not().exists(),

        check('phone')
          .not()
          .isEmpty()
          .matches(/^\d{10,11}$/)
      ],
      [
        check('phone').not().exists(),

        check('email')
          .not()
          .isEmpty()
          .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
      ]
    ],
    'Email or phone number must be provided at least one (email must contain @ and phone number must contain 10 or 11 numbers)'
  ),

  check('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .matches(/^[A-Za-z\d@$!%*?&]*$/)
    .withMessage('Password contains invalid characters')
]

const forgotPassword = () => [
  oneOf(
    [
      [
        check('email').not().exists(),

        check('phone')
          .not()
          .isEmpty()
          .matches(/^\d{10,11}$/)
      ],
      [
        check('phone').not().exists(),

        check('email')
          .not()
          .isEmpty()
          .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
      ]
    ],
    'Email or phone number must be provided at least one (email must contain @ and phone number must contain 10 or 11 numbers)'
  )
]

const changePassword = () => [
  check('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
    .withMessage(
      'Password must contain at least 6 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character such as @, $, !, %, *, ?, &'
    )
]

const authSocial = () => [
  check('firstName')
    .not()
    .isEmpty()
    .withMessage('FirstName is required')
    .isLength({ max: 32 })
    .withMessage('FirstName can contain up to 32 characters'),

  check('lastName')
    .not()
    .isEmpty()
    .withMessage('LastName is required')
    .isLength({ max: 32 })
    .withMessage('LastName can contain up to 32 characters'),

  check('email').not().isEmpty().withMessage('Email is required')
]

//custom validator
const checkStoreName = (val) => {
  const regex = [/g[o0][o0]d[^\w]*deal/i]

  let flag = true
  regex.forEach((regex) => {
    if (regex.test(val)) {
      flag = false
    }
  })

  if (!flag) {
    return Promise.reject('Name contains invalid characters')
  }

  return true
}

module.exports = {
  signup,
  signin,
  forgotPassword,
  changePassword,
  authSocial
}
