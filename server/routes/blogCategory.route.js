const router = require('express').Router()
const ctrl = require('../controllers/blogCategory.controller')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], ctrl.createBlogCategory)
router.get('/', ctrl.getBlogCategories)
router.put('/:bcid', [verifyAccessToken, isAdmin], ctrl.updateBlogCategory)
router.delete('/:bcid', [verifyAccessToken, isAdmin], ctrl.deleteBlogCategory)

module.exports = router
