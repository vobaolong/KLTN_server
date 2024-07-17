const { Server: SocketIOServer } = require('socket.io')
const {
  notificationOrder,
  notificationCancelled,
  notificationDelivered,
  notificationReturn
} = require('./controllers/notification')

const initSocketServer = (server) => {
  const io = new SocketIOServer(server)

  io.on('connection', (socket) => {
    socket.on('notificationOrder', async ({ objectId, from, to }) => {
      const [success, storeId] = await notificationOrder(objectId, from, to)
      if (success) {
        io.to(from).emit('notification', from)
        io.to(storeId).emit('notification', storeId)
      }
    })

    socket.on('notificationCancel', async ({ objectId, from, to }) => {
      const [success, storeId] = await notificationCancelled(objectId, from, to)
      if (success) {
        io.to(from).emit('notification', from)
        io.to(storeId).emit('notification', storeId)
      }
    })

    socket.on('notificationDelivered', async ({ objectId, from, to }) => {
      const [success, storeId] = await notificationDelivered(objectId, from, to)
      if (success) {
        io.to(to).emit('notification', to)
        io.to(storeId).emit('notification', storeId)
      }
    })

    socket.on('notificationReturn', async ({ objectId, from, to }) => {
      const [success, storeId] = await notificationReturn(objectId, from, to)
      if (success) {
        io.to(from).emit('notification', from)
        io.to(storeId).emit('notification', storeId)
      }
    })

    socket.on('notificationReport', async () => {
      const adminId = process.env.ADMIN_ID
      io.to(adminId).emit('notification', adminId)
    })

    socket.on('notificationShopNew', async () => {
      const adminId = process.env.ADMIN_ID
      io.to(adminId).emit('notification', adminId)
    })

    socket.on('join', (userId) => {
      socket.join(userId)
    })

    // socket.on('disconnect', () => {
    //   console.log('A user disconnected')
    // })
  })
}
module.exports = { initSocketServer }
