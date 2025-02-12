const MessageHandler = require("./messageHandler");

class SocketServer {
  constructor(io) {
    this.io = io;
    this.messageHandler = new MessageHandler(io);
  }

  start() {
    this.io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      socket.on("setup", (userId) => {
        this.messageHandler.activeUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.join(userId);
        console.log(`User ${userId} connected`);
        this.io.emit("user-online", userId);
      });

      socket.on("join-chat", (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.userId} joined chat ${chatId}`);
        socket.emit("joined-chat", chatId);
      });

      socket.on("send-message", async (data) => {
        try {
          const { sender, receiver, content, chatId } = data;

          const savedMessage = await this.messageHandler.saveMessage({
            sender,
            receiver,
            content,
            chatId,
          });

          this.io.to(chatId).emit("new-message", savedMessage);

          const receiverSocketId =
            this.messageHandler.activeUsers.get(receiver);
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("message-notification", {
              chatId,
              message: savedMessage,
            });
          }
        } catch (error) {
          console.error("Error handling message:", error);
          socket.emit("message-error", "Failed to send message");
        }
      });

      socket.on("typing", (data) => {
        const { chatId, userId } = data;
        socket.to(chatId).emit("user-typing", { chatId, userId });
      });

      socket.on("stop-typing", (data) => {
        const { chatId, userId } = data;
        socket.to(chatId).emit("user-stop-typing", { chatId, userId });
      });

      // Get chat history
      socket.on("get-chat-history", async (chatId) => {
        try {
          const messages = await this.messageHandler.getChatHistory(chatId);
          socket.emit("chat-history", messages);
        } catch (error) {
          socket.emit("chat-history-error", "Failed to fetch chat history");
        }
      });

      // Mark messages as read
      socket.on("mark-messages-read", async (data) => {
        try {
          const { chatId, userId } = data;
          await Message.updateMany(
            { chatId, receiver: userId, isRead: false },
            { isRead: true }
          );
          this.io.to(chatId).emit("messages-marked-read", { chatId, userId });
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        if (socket.userId) {
          this.messageHandler.activeUsers.delete(socket.userId);
          this.io.emit("user-offline", socket.userId);
          console.log(`User ${socket.userId} disconnected`);
        }
      });
    });
  }
}
