const express = require('express')
const router = express.Router()
const { reportShop } = require('../controllers/report')

router.post('/report', reportShop)

module.exports = router
