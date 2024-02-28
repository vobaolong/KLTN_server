const { check, oneOf } = require('express-validator')

const level = () => [
  check('name')
    .not()
    .isEmpty()
    .withMessage('Level name is required')
    .isLength({ max: 32 })
    .withMessage('Level name can contain up to 32 characters')
    .matches(/^(?=.*[a-zA-Z])[A-Za-z\d\s_'-]*$/)
    .withMessage(
      "Level name must contain at least one letter (can contain numbers, some special characters such as _, ', - and space)"
    ),

  check('minPoint')
    .not()
    .isEmpty()
    .withMessage('Level minPoint is required')
    .isInt({ min: 0 })
    .withMessage('Level minPoint must be int and greater than zero'),

  check('discount')
    .not()
    .isEmpty()
    .withMessage('Level discount is required')
    .isFloat({ min: 0 })
    .withMessage('Level discount must be decimal and greater than zero')
]

module.exports = {
  level
}
