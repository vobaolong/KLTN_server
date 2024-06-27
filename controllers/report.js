const Report = require('../models/report')
const Notification = require('../models/notification')

exports.reportShop = async (req, res) => {
  try {
    const { objectId, isStore, reason, reportBy } = req.body
    const report = new Report({
      objectId,
      isStore,
      reason,
      reportBy
    })

    await report.save()

    // Gửi thông báo cho admin
    const adminId = process.env.ADMIN_ID
    const adminNotification = new Notification({
      message: `Có báo cáo mới: ${reason}`,
      userId: adminId,
      isRead: false,
      orderId: objectId
    })

    await adminNotification.save()

    res.status(201).json({ message: 'Báo cáo đã được gửi' })
  } catch (error) {
    console.error('Error in reportShop:', error)
    res.status(500).json({ message: 'Lỗi server', error })
  }
}
