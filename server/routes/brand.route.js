const router = require('express').Router()
const ctrl = require('../controllers/brand.controller')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], ctrl.createBrand)
router.get('/', ctrl.getBrands)
router.put('/:bid', [verifyAccessToken, isAdmin], ctrl.updateBrand)
router.delete('/:bid', [verifyAccessToken, isAdmin], ctrl.deleteBrand)

module.exports = router
