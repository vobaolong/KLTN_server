const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
