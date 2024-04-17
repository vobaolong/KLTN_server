const express = require('express')
const router = express.Router()

//import controllers
const { isAuth } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { productById } = require('../controllers/product')
const {
  getNumberOfFollowersForProduct,
  followProduct,
  unfollowProduct,
  listFollowingProductsByUser,
  checkFollowingProduct
} = require('../controllers/userFollowProduct')

//routes
router.get(
  '/product/numberOfFollowers/:productId',
  getNumberOfFollowersForProduct
)
router.get('/follow/product/:productId/:userId', isAuth, followProduct)
router.delete('/unfollow/product/:productId/:userId', isAuth, unfollowProduct)
router.get('/following/products/:userId', isAuth, listFollowingProductsByUser)
router.get(
  '/check/following/products/:productId/:userId',
  isAuth,
  checkFollowingProduct
)

//params
router.param('userId', userById)
router.param('productId', productById)

module.exports = router
