const express = require('express')
const router = express.Router()

//import controllers
const { isAuth } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { storeById, updateNumberOfFollowers } = require('../controllers/store')
const {
  getNumberOfFollowers,
  followStore,
  unfollowStore,
  listFollowingStoresByUser,
  checkFollowingStore
} = require('../controllers/userFollowStore')

//routes
router.get('/store/numberOfFollowers/:storeId', getNumberOfFollowers)
router.get('/follow/store/:storeId/:userId', isAuth, followStore)
router.delete('/unfollow/store/:storeId/:userId', isAuth, unfollowStore)
router.get('/following/stores/:userId', isAuth, listFollowingStoresByUser)
router.get(
  '/check/following/stores/:storeId/:userId',
  isAuth,
  checkFollowingStore
)

//params
router.param('userId', userById)
router.param('storeId', storeById)

module.exports = router
