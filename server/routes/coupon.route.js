const router = require('express').Router()
const ctrl = require('../controllers/coupon.controller')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.get('/', ctrl.getCoupons)
// router.get('/one/:bid', ctrl.getCoupon)
router.post('/', [verifyAccessToken, isAdmin], ctrl.createCoupon)
router.put('/:cid', [verifyAccessToken, isAdmin], ctrl.updateCoupon)
router.delete('/:cid', [verifyAccessToken, isAdmin], ctrl.deleteCoupon)

module.exports = router
