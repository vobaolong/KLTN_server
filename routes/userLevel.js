const express = require('express')
const router = express.Router()

//import validators
const levelValidator = require('../validators/level')
const { validateHandler } = require('../helpers/validateHandler')

//import controllers
const { isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const {
  userLevelById,
  getUserLevel,
  createUserLevel,
  updateUserLevel,
  removeUserLevel,
  restoreUserLevel,
  listUserLevel,
  listActiveUserLevel
} = require('../controllers/userLevel')

//routes
router.get('/user/level/:userId', getUserLevel)
router.get('/user/active/levels', listActiveUserLevel)
router.get('/user/levels/:userId', isAuth, isAdmin, listUserLevel)
router.post(
  '/user/level/create/:userId',
  isAuth,
  isAdmin,
  levelValidator.level(),
  validateHandler,
  createUserLevel
)
router.put(
  '/user/level/:userLevelId/:userId',
  isAuth,
  isAdmin,
  levelValidator.level(),
  validateHandler,
  updateUserLevel
)
router.delete(
  '/user/level/:userLevelId/:userId',
  isAuth,
  isAdmin,
  removeUserLevel
)
router.get(
  '/user/level/restore/:userLevelId/:userId',
  isAuth,
  isAdmin,
  restoreUserLevel
)

//router params
router.param('userId', userById)
router.param('userLevelId', userLevelById)

module.exports = router
