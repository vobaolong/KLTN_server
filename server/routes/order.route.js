const router = require('express').Router()
const ctrl = require('../controllers/order.controller')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], ctrl.createOrder)
router.put('/status/:oid', [verifyAccessToken, isAdmin], ctrl.updateStatusOrder)
router.get('/', [verifyAccessToken], ctrl.getUserOrder)
router.get('/admin', [verifyAccessToken, isAdmin], ctrl.getAdminOrders)

module.exports = router
