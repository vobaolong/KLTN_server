const express = require('express')
const router = express.Router()

const { isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { variantById } = require('../controllers/variant')
const {
  variantValueById,
  createVariantValue,
  updateVariantValue,
  removeVariantValue,
  restoreVariantValue,
  listActiveVariantValuesByVariant,
  listVariantValuesByVariant
} = require('../controllers/variantValue')

router.get(
  '/active/variant/values/by/variant/:variantId',
  listActiveVariantValuesByVariant
)
router.get(
  '/variant/values/by/variant/:variantId/:userId',
  isAuth,
  isAdmin,
  listVariantValuesByVariant
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
