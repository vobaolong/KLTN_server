const router = require('express').Router()
const uploadCloud = require('../config/cloudinary.config')
const ctrl = require('../controllers/product.controller')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], ctrl.createProduct)
router.get('/', ctrl.getProducts)
router.put('/ratings', verifyAccessToken, ctrl.ratings)

router.put(
  '/upload-image/:pid',
  [verifyAccessToken, isAdmin],
  uploadCloud.array('images', 10),
  ctrl.uploadImgProduct
)

router.put('/:pid', [verifyAccessToken, isAdmin], ctrl.updateProduct)
router.delete('/:pid', [verifyAccessToken, isAdmin], ctrl.deleteProduct)
router.get('/:pid', ctrl.getProduct)

module.exports = router
