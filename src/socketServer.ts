import { Server as SocketIOServer } from "socket.io";
import http from "http";

const initSocketServer = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:3000", 
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 A user connected");

    socket.on("notification", (data) => {
      io.emit("newNotification", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ A user disconnected");
    });
  });
};

export default initSocketServer;
