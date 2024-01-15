const router = require('express').Router()
const ctrl = require('../controllers/insertData')

router.post('/', ctrl.insertProduct)
router.post('/cate', ctrl.insertCategory)

module.exports = router
