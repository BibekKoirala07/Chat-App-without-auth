const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const MessageHandler = require("./messageHandler");

class SocketServer {
  constructor(io) {
    this.io = io;
    this.messageHandler = new MessageHandler(io);
  }

  start() {
    this.io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      socket.on("setup", async (value) => {
        try {
          const { name } = value;

          let user = await User.findOne({ name });

          if (!user) {
            user = await User.create({ name });
          }

          const userId = user._id;

          // **Check if user is already connected**
          if (this.messageHandler.activeUsers.has(userId)) {
            const existingSocketId =
              this.messageHandler.activeUsers.get(userId);

            // **Disconnect the previous socket to prevent duplicates**
            if (this.io.sockets.sockets.get(existingSocketId)) {
              this.io.sockets.sockets.get(existingSocketId).disconnect(true);
              console.log(`Disconnected previous session for user ${userId}`);
            }
          }

          // **Now safely add new connection**
          this.messageHandler.activeUsers.set(userId, socket.id);

          socket.userId = userId;
          socket.join(userId);
          console.log(`User ${userId} connected`);

          this.io.emit("user-setup-complete", user);
          this.io.emit("user-online", userId);
        } catch (error) {
          console.error("Error in setup event:", error);
        }
      });

      // Handle the 'create-chat' event
      socket.on("create-chat", async (data) => {
        const { senderId, receiverId } = data;
        console.log("senderId, receiverId", senderId, receiverId);

        try {
          let chat = await Chat.findOne({
            members: { $all: [senderId, receiverId] }, // Check if chat already exists
          });

          if (chat) {
            console.log("Chat already exists:", chat);
            socket.emit("chatId-generated", chat);
          } else {
            console.log("Creating a new chat...");

            const newChat = new Chat({
              members: [senderId, receiverId],
              admin: senderId, // Default admin is sender
            });

            await newChat.save(); // Save the new chat in DB

            console.log("New chat created:", newChat);
            socket.emit("chatId-generated", newChat); // Send the newly created chat
          }
        } catch (err) {
          console.error("Error creating or finding chat:", err);
          socket.emit("chatId-generated", null);
        }
      });

      socket.on("join-chat", (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.userId} joined chat ${chatId}`);
        socket.emit("joined-chat", chatId);
      });

      socket.on("send-message", async (data) => {
        try {
          const { senderId, receiverId, content, chatId } = data;

          console.log("senderId, all text", data);
          const savedMessage = await Message.create({
            senderId,
            receiverId,
            content,
            chatId,
          });

          socket.emit("new-message", savedMessage);

          const receiverSocketId =
            this.messageHandler.activeUsers.get(receiverId);
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("new-message", savedMessage);
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

      socket.on("get-chat-history", async (chatId) => {
        try {
          const messages = await this.messageHandler.getChatHistory(chatId);
          socket.emit("chat-history", messages);
        } catch (error) {
          socket.emit("chat-history-error", "Failed to fetch chat history");
        }
      });

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

module.exports = SocketServer;
