const express = require('express')
const router = express.Router()

//controllers
const {
  isAuth,
  isAdmin,
  isManager,
  isOwner,
  verifyPassword
} = require('../controllers/auth')
const { userById, getUserProfile } = require('../controllers/user')
const { storeById, getStoreProfile } = require('../controllers/store')
const {
  requestTransaction,
  updateEWallet,
  createTransaction,
  listTransactions
} = require('../controllers/transaction')

//routes
router.get('/transactions/by/user/:userId', isAuth, listTransactions)
router.get(
  '/transactions/by/store/:storeId/:userId',
  isAuth,
  isManager,
  listTransactions
)
router.get('/transactions/for/admin/:userId', isAuth, isAdmin, listTransactions)
router.post(
  '/transaction/create/by/user/:userId',
  isAuth,
  verifyPassword,
  requestTransaction,
  updateEWallet,
  createTransaction,
  getUserProfile
)
router.post(
  '/transaction/create/by/store/:storeId/:userId',
  isAuth,
  verifyPassword,
  isOwner,
  requestTransaction,
  updateEWallet,
  createTransaction,
  getStoreProfile
)
// router.post(
//     '/transaction/create/for/admin/:userId',
//     isAuth,
//     verifyPassword,
//     isAdmin,
//     requestTransaction,
//     updateEWallet,
//     createTransaction,
// );

//params
router.param('storeId', storeById)
router.param('userId', userById)

module.exports = router
