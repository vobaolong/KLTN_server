const router = require('express').Router()
const ctrl = require('../controllers/productCategory.controller')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], ctrl.createProductCategory)
router.get('/', ctrl.getProductCategories)
router.put('/:pcid', [verifyAccessToken, isAdmin], ctrl.updateProductCategory)
router.delete(
  '/:pcid',
  [verifyAccessToken, isAdmin],
  ctrl.deleteProductCategory
)

module.exports = router
