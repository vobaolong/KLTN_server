const express = require('express')
const {
  getReports,
  createReport,
  deleteReport
} = require('../controllers/report')
const router = express.Router()

router.get('/reports', getReports)
router.post('/reports', createReport)
router.delete('/reports/:id', deleteReport)

module.exports = router
