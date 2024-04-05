const express = require('express')
const router = express.Router()

//import controllers
const { isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { variantById } = require('../controllers/variant')
const {
  variantValueById,
  createVariantValue,
  updateVariantValue,
  removeVariantValue,
  restoreVariantValue,
  listActiveVariantValuesByStyle,
  listVariantValuesByStyle
} = require('../controllers/variantValue')

//routes
router.get(
  '/active/variant/values/by/variant/:variantId',
  listActiveVariantValuesByStyle
)
router.get(
  '/variant/values/by/variant/:variantId/:userId',
  isAuth,
  isAdmin,
  listVariantValuesByStyle
)
router.post('/variant/value/create/:userId', isAuth, createVariantValue)
router.put(
  '/variant/value/:variantValueId/:userId',
  isAuth,
  isAdmin,
  updateVariantValue
)
router.delete(
  '/variant/value/:variantValueId/:userId',
  isAuth,
  isAdmin,
  removeVariantValue
)
router.get(
  '/variant/value/restore/:variantValueId/:userId',
  isAuth,
  isAdmin,
  restoreVariantValue
)

//router params
router.param('variantValueId', variantValueById)
router.param('variantId', variantById)
router.param('userId', userById)

module.exports = router
