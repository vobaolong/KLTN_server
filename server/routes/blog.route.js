const router = require('express').Router()
const ctrl = require('../controllers/blog.controller')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.get('/', ctrl.getBlogs)
router.get('/one/:bid', ctrl.getBlog)
router.post('/', [verifyAccessToken, isAdmin], ctrl.createBlog)
router.put('/:bid', [verifyAccessToken, isAdmin], ctrl.updateBlog)
router.delete('/:bid', [verifyAccessToken, isAdmin], ctrl.deleteBlog)
router.put('/likes/:bid', [verifyAccessToken], ctrl.likeBlog)
router.put('/dislikes/:bid', [verifyAccessToken], ctrl.dislikeBlog)

module.exports = router
