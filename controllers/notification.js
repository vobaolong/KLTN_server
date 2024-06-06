const Notification = require('../models/notification')
const Store = require('../models/store')

exports.notificationOrder = async (orderId, from, to) => {
  try {
    const store = await Store.findById(to)
    const buyerNotification = new Notification({
      message: `Đặt hàng thành công`,
      userId: from,
      isRead: false,
      orderId: orderId
    })

    const sellerNotification = new Notification({
      message: `Có đơn hàng mới`,
      userId: store.ownerId.toString(),
      isRead: false,
      orderId: orderId
    })

    await Promise.all([buyerNotification.save(), sellerNotification.save()])

    return [true, store.ownerId.toString()]
  } catch (error) {
    return [false, '']
  }
}

exports.notificationCancelled = async (orderId, from, to) => {
  try {
    const store = await Store.findById(to)

    const buyerNotification = new Notification({
      message: `Huỷ đơn hàng thành công`,
      userId: from,
      isRead: false,
      orderId: orderId
    })

    const sellerNotification = new Notification({
      message: `Có đơn hàng bị huỷ`,
      userId: store.ownerId.toString(),
      isRead: false,
      orderId: orderId
    })

    await Promise.all([buyerNotification.save(), sellerNotification.save()])

    return [true, store.ownerId.toString()]
  } catch (error) {
    return [false, '']
  }
}

exports.deleteNotifications = async (req, res) => {
  const { userId } = req.params

  try {
    await Notification.deleteMany({
      userId
    })
    return res.status(200).json('delete successfully')
  } catch (error) {
    return res.status(500).json('delete error')
  }
}

exports.getNotifications = async (req, res) => {
  const { userId } = req.params

  const notifications = await Notification.find({
    userId
  })

  if (notifications) {
    let noti = 0

    notifications.forEach((n) => {
      if (!n.isRead) noti++
    })
    return res.status(200).json({
      notifications: notifications,
      numberHidden: noti
    })
  }

  return res.status(404).json({ error: 'not found' })
}

exports.updateRead = async (req, res) => {
  const { userId } = req.params

  try {
    await Notification.updateMany(
      {
        userId: userId
      },
      {
        $set: { isRead: true }
      },
      { new: true }
    )

    return res.status(200).json('update successfully')
  } catch (error) {
    return res.status(500).json('update error')
  }
}
