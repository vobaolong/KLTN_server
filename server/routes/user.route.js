const router = require('express').Router()
const ctrl = require('../controllers/user.controller')

router.post('/register', ctrl.register)

module.exports = router
