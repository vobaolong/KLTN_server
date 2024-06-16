const { Server: SocketIOServer } = require('socket.io')
const {
  notificationOrder,
  notificationCancelled,
  notificationDelivered,
  notificationLowStock
} = require('./controllers/notification')

const initSocketServer = (server) => {
  const io = new SocketIOServer(server)

  io.on('connection', (socket) => {
    socket.on('notificationOrder', async ({ orderId, from, to }) => {
      const [success, storeId] = await notificationOrder(orderId, from, to)
      if (success) {
        io.to(from).emit('notification', from)
        io.to(storeId).emit('notification', storeId)
      }
    })

    socket.on('notificationCancel', async ({ orderId, from, to }) => {
      const [success, storeId] = await notificationCancelled(orderId, from, to)
      if (success) {
        io.to(from).emit('notification', from)
        io.to(storeId).emit('notification', storeId)
      }
    })

    socket.on('notificationDelivered', async ({ orderId, from, to }) => {
      const [success, storeId] = await notificationDelivered(orderId, from, to)
      if (success) {
        io.to(to).emit('notification', to)
        io.to(storeId).emit('notification', storeId)
      }
    })

    socket.on('notificationLowStock', async ({ orderId, from, to }) => {
      const [success, storeId] = await notificationLowStock(orderId, from, to)
      if (success) {
        io.to(from).emit('notification', from)
        io.to(storeId).emit('notification', storeId)
      }
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
