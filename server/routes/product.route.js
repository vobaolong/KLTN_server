const router = require('express').Router()
const ctrl = require('../controllers/product.controller')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], ctrl.createProduct)
router.get('/', ctrl.getProducts)
router.put('/:pid', [verifyAccessToken, isAdmin], ctrl.updateProduct)
router.delete('/:pid', [verifyAccessToken, isAdmin], ctrl.deleteProduct)
router.get('/:pid', ctrl.getProduct)

module.exports = router
