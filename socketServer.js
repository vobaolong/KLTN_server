const { Server: SocketIOServer } = require("socket.io");
const {
  notificationOrder,
  notificationCancelled,
} = require("./controllers/notification");

const initSocketServer = (server) => {
  const io = new SocketIOServer(server);

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("notificationOrder", async ({ orderId, from, to }) => {
      const [success, storeId] = await notificationOrder(orderId, from, to);

      if (success) {
        io.to(from).emit("notification", from);
        io.to(storeId).emit("notification", storeId);
      }
    });

    socket.on("notificationCancel", async ({ oderId, from, to }) => {
      const [success, storeId] = await notificationCancelled(oderId, from, to);
      if (success) {
        io.to(from).emit("notification", from);
        io.to(storeId).emit("notification", storeId);
      }
    });

    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
module.exports = { initSocketServer };
