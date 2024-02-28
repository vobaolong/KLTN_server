const { check } = require('express-validator')
const Commission = require('../models/commission')

const createStore = () => [
  check('name')
    .not()
    .isEmpty()
    .withMessage('Store name is required')
    .isLength({ max: 100 })
    .withMessage('Store name can contain up to 100 characters')
    .matches(
      /^(?=.*[a-zA-Z])[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\d\s_'-]*$/
    )
    .withMessage(
      "Store name must contain at least one letter (can contain numbers, some special characters such as _, ', - and space)"
    )
    .custom(checkStoreName),

  check('bio')
    .not()
    .isEmpty()
    .withMessage('Store bio is required')
    .isLength({ max: 3000 })
    .withMessage('Store bio can contain up to 3000 characters'),

  check('commissionId')
    .not()
    .isEmpty()
    .withMessage('CommissionId is required')
    .custom(checkCommission)
]

const updateStore = () => [
  check('name')
    .not()
    .isEmpty()
    .withMessage('Store name is required')
    .isLength({ max: 100 })
    .withMessage('Store name can contain up to 100 characters')
    .matches(
      /^(?=.*[a-zA-Z])[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\d\s_'-]*$/
    )
    .withMessage(
      "Store name must contain at least one letter (can contain numbers, some special characters such as _, ', - and space)"
    )
    .custom(checkStoreName),

  check('bio')
    .not()
    .isEmpty()
    .isLength({ max: 3000 })
    .withMessage('Store bio is required')
    .withMessage('Store bio can contain up to 3000 characters')
]

const activeStore = () => [
  check('isActive')
    .not()
    .isEmpty()
    .isBoolean()
    .withMessage('isActive is required')
    .withMessage('isActive type is boolean')
]

const updateCommission = () => [
  check('commissionId')
    .not()
    .isEmpty()
    .custom(checkCommission)
    .withMessage('commissionId is required')
]

const openStore = () => [
  check('isOpen')
    .not()
    .isEmpty()
    .isBoolean()
    .withMessage('isOpen is required')
    .withMessage('isOpen type is boolean')
]

//custom validator
const checkStoreName = (val) => {
  const regex = [/g[o0][o0]d[^\w]*deal/i, /admin/i]

  let flag = true
  regex.forEach((regex) => {
    if (regex.test(val)) {
      flag = false
    }
  })

  if (!flag) {
    return Promise.reject('Store name contains invalid characters')
  }

  return true
}

// const checkStatus = (val) => {
//   const stt = ['open', 'close']
//   if (stt.indexOf(val) == -1) {
//     return Promise.reject('Status is invalid, status type is enum value')
//   }

//   return true
// }

const checkCommission = (val) => {
  return new Promise((resolve, reject) => {
    Commission.findOne({ _id: val, isDeleted: false })
      .exec()
      .then((commission) => {
        if (!commission) {
          reject('Commission not found')
        }
        resolve()
      })
      .catch((error) => {
        reject('Commission not found')
      })
  })
}

module.exports = {
  createStore,
  updateStore,
  activeStore,
  updateCommission,
  openStore
}
