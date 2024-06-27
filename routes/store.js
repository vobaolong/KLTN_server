const express = require('express')
const router = express.Router()
const storeValidator = require('../validators/store')
const { validateHandler } = require('../helpers/validateHandler')

const { isAuth, isAdmin, isManager, isOwner } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { upload } = require('../controllers/upload')
const {
  storeById,
  getStore,
  createStore,
  getStoreProfile,
  updateStore,
  activeStore,
  updateCommission,
  openStore,
  updateAvatar,
  updateCover,
  listFeatureImages,
  addFeatureImage,
  updateFeatureImage,
  removeFeaturedImage,
  addStaff,
  cancelStaff,
  listStaff,
  removeStaff,
  listStoreCommissions,
  listStores,
  listStoresByUser,
  listStoresForAdmin,
  getCommission
} = require('../controllers/store')
const { activeAllProduct } = require('../controllers/product')

router.get('/store/:storeId', getStore)

router.get(
  '/store/profile/:storeId/:userId',
  isAuth,
  isManager,
  getStoreProfile
)

router.get('/stores', listStoreCommissions, listStores)

router.get(
  '/stores/by/user/:userId',
  isAuth,
  listStoreCommissions,
  listStoresByUser
)

router.get(
  '/stores/for/admin/:userId',
  isAuth,
  isAdmin,
  listStoreCommissions,
  listStoresForAdmin
)

router.post('/store/create/:userId', isAuth, upload, createStore)

router.put(
  '/store/:storeId/:userId',
  isAuth,
  isManager,
  storeValidator.updateStore(),
  validateHandler,
  updateStore
)

router.put(
  '/store/active/:storeId/:userId',
  isAuth,
  isAdmin,
  storeValidator.activeStore(),
  validateHandler,
  activeStore,
  activeAllProduct
)

router.get('/store/commission/:storeId', getCommission)

router.put(
  '/store/commission/:storeId/:userId',
  isAuth,
  isAdmin,
  storeValidator.updateCommission(),
  validateHandler,
  updateCommission
)

router.put(
  '/store/open/:storeId/:userId',
  isAuth,
  isManager,
  storeValidator.openStore(),
  validateHandler,
  openStore
)

router.put(
  '/store/avatar/:storeId/:userId',
  isAuth,
  isManager,
  upload,
  updateAvatar
)

router.put(
  '/store/cover/:storeId/:userId',
  isAuth,
  isManager,
  upload,
  updateCover
)

router.get('/store/featured/images/:storeId', listFeatureImages)

router.post(
  '/store/featured/image/:storeId/:userId',
  isAuth,
  isManager,
  upload,
  addFeatureImage
)

router.put(
  '/store/featured/image/:storeId/:userId',
  isAuth,
  isManager,
  upload,
  updateFeatureImage
)

router.delete(
  '/store/featured/image/:storeId/:userId',
  isAuth,
  isManager,
  removeFeaturedImage
)

router.get('/store/staff/:storeId/:userId', isAuth, isManager, listStaff)

router.post('/store/staff/:storeId/:userId', isAuth, isOwner, addStaff)

router.delete(
  '/store/staff/remove/:storeId/:userId',
  isAuth,
  isOwner,
  removeStaff
)

router.delete(
  '/store/staff/cancel/:storeId/:userId',
  isAuth,
  isManager,
  cancelStaff
)

//router params
router.param('userId', userById)

router.param('storeId', storeById)

module.exports = router
