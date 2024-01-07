const router = require('express').Router()
const ctrl = require('../controllers/insertData')

router.post('/', ctrl.insertProduct)

module.exports = router
