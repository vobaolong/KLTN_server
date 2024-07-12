const express = require('express')
const router = express.Router()

const {
  getNotifications,
  updateRead,
  deleteNotifications
} = require('../controllers/notification')
const {
  sendBanStoreEmail,
  sendActiveStoreEmail,
  sendBanProductEmail,
  sendActiveProductEmail,
  sendCreateStoreEmail
} = require('../controllers/email')

router.get('/notification/:userId', getNotifications)
router.put('/notification/:userId', updateRead)
router.delete('/notification/:userId', deleteNotifications)
router.post('/send-ban-store/:userId/:storeId', sendBanStoreEmail)
router.post('/send-create-store/:userId/:storeId', sendCreateStoreEmail)
router.post('/send-active-store/:userId/:storeId', sendActiveStoreEmail)

router.post('/send-ban-product/:userId', sendBanProductEmail)

router.post('/send-active-product/:userId', sendActiveProductEmail)

module.exports = router
