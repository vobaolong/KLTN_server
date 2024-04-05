const express = require('express')
const router = express.Router()

//import controllers
const { isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { checkListCategoriesChild } = require('../controllers/category')
const {
  variantById,
  getVariant,
  checkVariant,
  createVariant,
  updateVariant,
  removeVariant,
  restoreVariant,
  listVariants,
  listActiveVariants
} = require('../controllers/variant')
const {
  removeAllVariantValue,
  restoreAllVariantValue
} = require('../controllers/variantValue')

//routes
router.get('/variant/by/id/:variantId/:userId', isAuth, isAdmin, getVariant)
router.get('/active/variants', listActiveVariants)
router.get('/variants/:userId', isAuth, isAdmin, listVariants)
router.post(
  '/variant/create/:userId',
  isAuth,
  isAdmin,
  checkListCategoriesChild,
  checkVariant,
  createVariant
)
router.put(
  '/variant/:variantId/:userId',
  isAuth,
  isAdmin,
  checkListCategoriesChild,
  checkVariant,
  updateVariant
)
router.delete(
  '/variant/:variantId/:userId',
  isAuth,
  isAdmin,
  removeVariant,
  removeAllVariantValue
)
router.get(
  '/variant/restore/:variantId/:userId',
  isAuth,
  isAdmin,
  restoreVariant,
  restoreAllVariantValue
)

//router params
router.param('variantId', variantById)
router.param('userId', userById)

module.exports = router
