const express = require("express");
const router = express.Router();

const {
  getNotifications,
  updateRead,
  deleteNotifications,
} = require("../controllers/notification");
const {
  sendBanStoreEmail,
  sendActiveStoreEmail,
  sendBanProductEmail,
  sendActiveProductEmail,
} = require("../controllers/email");
const { isAuth } = require("../controllers/auth");

router.get("/notification/:userId", getNotifications);
router.put("/notification/:userId", updateRead);
router.delete("/notification/:userId", deleteNotifications);
router.post("/send-ban-store/:userId", sendBanStoreEmail);
router.post("/send-active-store/:userId", sendActiveStoreEmail);

router.post("/send-ban-product/:userId", sendBanProductEmail);
router.post("/send-active-product/:userId", sendActiveProductEmail);

module.exports = router;
