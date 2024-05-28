const express = require("express");
const router = express.Router();

const {
  getNotifications,
  updateRead,
  deleteNotifications,
} = require("../controllers/notification");

router.get("/notification/:userId", getNotifications);
router.put("/notification/:userId", updateRead);
router.delete("/notification/:userId", deleteNotifications);

module.exports = router;
