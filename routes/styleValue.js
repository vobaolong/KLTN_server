const express = require('express')
const router = express.Router()

//import controllers
const { isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { styleById } = require('../controllers/style')
const {
  styleValueById,
  createStyleValue,
  updateStyleValue,
  removeStyleValue,
  restoreStyleValue,
  listActiveStyleValuesByStyle,
  listStyleValuesByStyle
} = require('../controllers/styleValue')

//routes
router.get(
  '/active/style/values/by/style/:styleId',
  listActiveStyleValuesByStyle
)
router.get(
  '/style/values/by/style/:styleId/:userId',
  isAuth,
  isAdmin,
  listStyleValuesByStyle
)
router.post('/style/value/create/:userId', isAuth, createStyleValue)
router.put(
  '/style/value/:styleValueId/:userId',
  isAuth,
  isAdmin,
  updateStyleValue
)
router.delete(
  '/style/value/:styleValueId/:userId',
  isAuth,
  isAdmin,
  removeStyleValue
)
router.get(
  '/style/value/restore/:styleValueId/:userId',
  isAuth,
  isAdmin,
  restoreStyleValue
)

//router params
router.param('styleValueId', styleValueById)
router.param('styleId', styleById)
router.param('userId', userById)

module.exports = router
