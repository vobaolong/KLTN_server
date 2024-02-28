const express = require('express')
const router = express.Router()

//import controllers
const { isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { checkListCategoriesChild } = require('../controllers/category')
const {
  styleById,
  getStyle,
  checkStyle,
  createStyle,
  updateStyle,
  removeStyle,
  restoreStyle,
  listStyles,
  listActiveStyles
} = require('../controllers/style')
const {
  removeAllStyleValue,
  restoreAllStyleValue
} = require('../controllers/styleValue')

//routes
router.get('/style/by/id/:styleId/:userId', isAuth, isAdmin, getStyle)
router.get('/active/styles', listActiveStyles)
router.get('/styles/:userId', isAuth, isAdmin, listStyles)
router.post(
  '/style/create/:userId',
  isAuth,
  isAdmin,
  checkListCategoriesChild,
  checkStyle,
  createStyle
)
router.put(
  '/style/:styleId/:userId',
  isAuth,
  isAdmin,
  checkListCategoriesChild,
  checkStyle,
  updateStyle
)
router.delete(
  '/style/:styleId/:userId',
  isAuth,
  isAdmin,
  removeStyle,
  removeAllStyleValue
)
router.get(
  '/style/restore/:styleId/:userId',
  isAuth,
  isAdmin,
  restoreStyle,
  restoreAllStyleValue
)

//router params
router.param('styleId', styleById)
router.param('userId', userById)

module.exports = router
