const express = require('express')
const router = express.Router()

const { isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const {
  deliveryById,
  readDelivery,
  createDelivery,
  updateDelivery,
  removeDelivery,
  restoreDelivery,
  listActiveDeliveries,
  listDeliveries
} = require('../controllers/delivery')

//routes
router.get('/delivery/by/id/:deliveryId/:userId', isAuth, isAdmin, readDelivery)
router.get('/active/deliveries', listActiveDeliveries)
router.get('/deliveries/:userId', isAuth, isAdmin, listDeliveries)
router.post('/delivery/create/:userId', isAuth, isAdmin, createDelivery)
router.put('/delivery/:deliveryId/:userId', isAuth, isAdmin, updateDelivery)
router.delete('/delivery/:deliveryId/:userId', isAuth, isAdmin, removeDelivery)
router.get(
  '/delivery/restore/:deliveryId/:userId',
  isAuth,
  isAdmin,
  restoreDelivery
)

//router params
router.param('deliveryId', deliveryById)
router.param('userId', userById)

module.exports = router
