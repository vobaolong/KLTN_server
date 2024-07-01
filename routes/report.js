const express = require("express");
const router = express.Router();
const { report, getReport, deleteReport } = require("../controllers/report");

router.post("/reports", report);
router.get("/reports", getReport);
router.delete("/reports/:id", deleteReport);

module.exports = router;
