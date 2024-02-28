const express = require('express')
const router = express.Router()

//controllers
const { isAuth } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const {
  cartById,
  cartItemById,
  createCart,
  createCartItem,
  listCarts,
  listItemByCard,
  updateCartItem,
  removeCartItem,
  removeCart,
  countCartItems
} = require('../controllers/cart')

//routes
router.get('/cart/count/:userId', isAuth, countCartItems)
router.get('/carts/:userId', isAuth, listCarts)
router.get('/cart/items/:cartId/:userId', isAuth, listItemByCard)
router.post('/cart/add/:userId', isAuth, createCart, createCartItem, removeCart)
router.put('/cart/update/:cartItemId/:userId', isAuth, updateCartItem)
router.delete(
  '/cart/remove/:cartItemId/:userId',
  isAuth,
  removeCartItem,
  removeCart
)

//params
router.param('cartId', cartById)
router.param('cartItemId', cartItemById)
router.param('userId', userById)

module.exports = router
