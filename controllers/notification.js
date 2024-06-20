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
    console.log('Send notification create successfully order')
    return [true, store.ownerId.toString()]
  } catch (error) {
    console.error('Error in notificationOrder:', error)
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
    console.error('Error in notificationCancelled:', error)
    return [false, '']
  }
}

exports.notificationDelivered = async (orderId, from, to) => {
  try {
    const buyerNotification = new Notification({
      message: `Đơn hàng đã được giao`,
      userId: to,
      isRead: false,
      orderId: orderId
    })

    await buyerNotification.save()
    console.log('Send notification successfully')
    return [true, '']
  } catch (error) {
    console.error('Error in notificationDelivered:', error)
    return [false, '']
  }
}

exports.deleteNotifications = async (req, res) => {
  const { userId } = req.params

  try {
    await Notification.deleteMany({ userId })
    return res.status(200).json('delete successfully')
  } catch (error) {
    console.error('Error in deleteNotifications:', error)
    return res.status(500).json('delete error')
  }
}

exports.getNotifications = async (req, res) => {
  const { userId } = req.params

  try {
    const notifications = await Notification.find({ userId })

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
  } catch (error) {
    console.error('Error in getNotifications:', error)
    return res.status(500).json('get error')
  }
}

exports.updateRead = async (req, res) => {
  const { userId } = req.params

  try {
    await Notification.updateMany(
      { userId },
      { $set: { isRead: true } },
      { new: true }
    )

    return res.status(200).json('update successfully')
  } catch (error) {
    console.error('Error in updateRead:', error)
    return res.status(500).json('update error')
  }
}
