const { Server: SocketIOServer } = require('socket.io')

const initSocketServer = (server) => {
  const io = new SocketIOServer(server)

  io.on('connection', (socket) => {
    console.log('A user connected')

    socket.on('notification', (data) => {
      io.emit('newNotification', data)
    })

    socket.on('disconnect', () => {
      console.log('A user disconnected')
    })
  })
}
module.exports = { initSocketServer }
