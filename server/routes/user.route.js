const router = require('express').Router()
const ctrl = require('../controllers/user.controller')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/register', ctrl.register)
router.post('/login', ctrl.login)
router.get('/current', verifyAccessToken, ctrl.getCurrent)
router.post('/refresh-token', ctrl.refreshAccessToken)
router.get('/logout', ctrl.logout)
router.get('/forgot-password', ctrl.forgotPassword)
router.put('/resetpassword', ctrl.resetPassword)
router.get('/', [verifyAccessToken, isAdmin], ctrl.getUsers)
router.delete('/', [verifyAccessToken, isAdmin], ctrl.deleteUser)
router.put('/current', [verifyAccessToken], ctrl.updateUser)
router.put('/address', [verifyAccessToken], ctrl.updateUserAddress)
router.put('/cart', [verifyAccessToken], ctrl.updateCart)
router.put('/:uid', [verifyAccessToken, isAdmin], ctrl.updateUserByAdmin)

module.exports = router
