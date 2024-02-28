const express = require('express')
const router = express.Router()

//import validators
const userValidator = require('../validators/user')
const { validateHandler } = require('../helpers/validateHandler')

//import controllers
const { isAuth, isAdmin, verifyPassword } = require('../controllers/auth')
const { upload } = require('../controllers/upload')
const {
  userById,
  getUser,
  updateProfile,
  addAddress,
  updateAddress,
  removeAddress,
  updateAvatar,
  updateCover,
  listUser,
  getUserProfile,
  listUserForAdmin,
  updatePassword
} = require('../controllers/user')

//routes
router.get('/user/:userId', getUser)
router.get('/user/profile/:userId', isAuth, getUserProfile)
router.put(
  '/user/profile/:userId',
  isAuth,
  userValidator.updateProfile(),
  validateHandler,
  updateProfile
)
router.put(
  '/user/password/:userId',
  isAuth,
  userValidator.updateAccount(),
  validateHandler,
  verifyPassword,
  updatePassword
)

//list
router.get('/users', listUser)
router.get('/users/for/admin/:userId', isAuth, isAdmin, listUserForAdmin)

//address
router.post(
  '/user/address/:userId',
  isAuth,
  userValidator.userAddress(),
  validateHandler,
  addAddress
)
router.put(
  '/user/address/:userId',
  isAuth,
  userValidator.userAddress(),
  validateHandler,
  updateAddress
)
router.delete('/user/address/:userId', isAuth, removeAddress)

//avatar
router.put('/user/avatar/:userId', isAuth, upload, updateAvatar)
//cover
router.put('/user/cover/:userId', isAuth, upload, updateCover)

//router params
router.param('userId', userById)

module.exports = router
