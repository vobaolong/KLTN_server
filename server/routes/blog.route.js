const router = require('express').Router()
const uploadCloud = require('../config/cloudinary.config')
const ctrl = require('../controllers/blog.controller')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.get('/', ctrl.getBlogs)
router.get('/one/:bid', ctrl.getBlog)
router.post('/', [verifyAccessToken, isAdmin], ctrl.createBlog)
router.put('/:bid', [verifyAccessToken, isAdmin], ctrl.updateBlog)
router.delete('/:bid', [verifyAccessToken, isAdmin], ctrl.deleteBlog)
router.put('/likes/:bid', [verifyAccessToken], ctrl.likeBlog)
router.put('/dislikes/:bid', [verifyAccessToken], ctrl.dislikeBlog)

router.put(
  '/image/:bid',
  [verifyAccessToken, isAdmin],
  uploadCloud.single('image'),
  ctrl.uploadImgBlog
)

module.exports = router
