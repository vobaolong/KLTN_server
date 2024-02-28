const express = require('express')
const router = express.Router()

//controllers
const { isAuth, isAdmin, isManager } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { storeById } = require('../controllers/store')
const { cartById } = require('../controllers/cart')
const {
  updateEWallet,
  createTransaction
} = require('../controllers/transaction')
const {
  orderById,
  createOrder,
  createOrderItems,
  removeCart,
  removeAllCartItems,
  listOrderForAdmin,
  listOrderByStore,
  listOrderByUser,
  checkOrderAuth,
  readOrder,
  updateStatusForUser,
  updateStatusForStore,
  updateStatusForAdmin,
  updateQuantitySoldProduct,
  countOrders,
  listOrderItems,
  updatePoint
} = require('../controllers/order')

//routes
router.get('/orders/count', countOrders)
router.get(
  '/order/items/by/user/:orderId/:userId',
  isAuth,
  checkOrderAuth,
  listOrderItems
)
router.get(
  '/order/items/by/store/:orderId/:storeId/:userId',
  isAuth,
  isManager,
  checkOrderAuth,
  listOrderItems
)
router.get(
  '/order/items/for/admin/:orderId/:userId',
  isAuth,
  isAdmin,
  checkOrderAuth,
  listOrderItems
)
router.get('/order/by/user/:orderId/:userId', isAuth, checkOrderAuth, readOrder)
router.get(
  '/order/by/store/:orderId/:storeId/:userId',
  isAuth,
  isManager,
  checkOrderAuth,
  readOrder
)
router.get(
  '/order/for/admin/:orderId/:userId',
  isAuth,
  isAdmin,
  checkOrderAuth,
  readOrder
)
router.get('/orders/by/user/:userId', isAuth, listOrderByUser)
router.get(
  '/orders/by/store/:storeId/:userId',
  isAuth,
  isManager,
  listOrderByStore
)
router.get('/orders/for/admin/:userId', isAuth, isAdmin, listOrderForAdmin)
router.post(
  '/order/create/:cartId/:userId',
  isAuth,
  createOrder,
  createOrderItems,
  removeCart,
  removeAllCartItems
)
router.put(
  '/order/update/by/user/:orderId/:userId',
  isAuth,
  checkOrderAuth,
  updateStatusForUser,
  updateEWallet,
  createTransaction,
  updatePoint
)
router.put(
  '/order/update/by/store/:orderId/:storeId/:userId',
  isAuth,
  isManager,
  checkOrderAuth,
  updateStatusForStore,
  updateEWallet,
  createTransaction,
  updatePoint
)
router.put(
  '/order/update/for/admin/:orderId/:userId',
  isAuth,
  isAdmin,
  checkOrderAuth,
  updateStatusForAdmin,
  updateEWallet,
  createTransaction,
  updateQuantitySoldProduct,
  updatePoint
)

//params
router.param('orderId', orderById)
router.param('cartId', cartById)
router.param('storeId', storeById)
router.param('userId', userById)

module.exports = router
