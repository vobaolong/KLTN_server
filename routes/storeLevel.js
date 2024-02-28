const express = require('express')
const router = express.Router()

//import validators
const levelValidator = require('../validators/level')
const { validateHandler } = require('../helpers/validateHandler')

//import controllers
const { isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { storeById } = require('../controllers/store')
const {
  storeLevelById,
  getStoreLevel,
  listStoreLevel,
  listActiveStoreLevel,
  createStoreLevel,
  updateStoreLevel,
  removeStoreLevel,
  restoreStoreLevel
} = require('../controllers/storeLevel')

//routes
router.get('/store/level/:storeId', getStoreLevel)
router.get('/store/active/levels', listActiveStoreLevel)
router.get('/store/levels/:userId', isAuth, isAdmin, listStoreLevel)
router.post(
  '/store/level/create/:userId',
  isAuth,
  isAdmin,
  levelValidator.level(),
  validateHandler,
  createStoreLevel
)
router.put(
  '/store/level/:storeLevelId/:userId',
  isAuth,
  isAdmin,
  levelValidator.level(),
  validateHandler,
  updateStoreLevel
)
router.delete(
  '/store/level/:storeLevelId/:userId',
  isAuth,
  isAdmin,
  removeStoreLevel
)
router.get(
  '/store/level/restore/:storeLevelId/:userId',
  isAuth,
  isAdmin,
  restoreStoreLevel
)

//router params
router.param('userId', userById)
router.param('storeId', storeById)
router.param('storeLevelId', storeLevelById)

module.exports = router
