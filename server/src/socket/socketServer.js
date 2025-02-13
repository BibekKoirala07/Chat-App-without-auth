const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");

const connectedUserIdToSocketId = new Map();
let activeRooms = [];

const handleActiveUsers = () => {
  const arr = [];
  for (let [userId, socketId] of connectedUserIdToSocketId.entries()) {
    arr.push(userId);
  }
  return arr;
};

module.exports = (io) => {
  io.on("connection", function (socket) {
    console.log("a user connected", socket.id);

    socket.on("setup", async (data) => {
      const { name } = data;
      console.log("Setup received for user:", name);
      if (!name) {
        return;
      }

      let user = await User.findOne({ name });

      if (!user) {
        user = await User.create({ name });
        console.log("New user created:", user);
      }

      const userId = user._id;

      if (connectedUserIdToSocketId.has(userId.toString())) {
        const existingSocketId = connectedUserIdToSocketId.get(userId);

        if (existingSocketId) {
          console.log("User already connected with socket:", existingSocketId);
          // Emit error to the current socket (avoid multiple connections for same user)
          socket.emit("error", {
            message: `User ${userId} is already connected with socket ${existingSocketId}.`,
          });
          return;
        }
      }

      connectedUserIdToSocketId.set(userId.toString(), socket.id);
      // console.log("User connected:", userId, "Socket ID:", socket.id);

      socket.emit("user-setup-complete", user);

      io.emit("active-users", handleActiveUsers());
    });

    socket.on("create-chat", async (data) => {
      const { senderId, receiverId } = data;
      console.log("senderId, receiverId", senderId, receiverId);
      try {
        let chat = await Chat.findOne({
          members: { $all: [senderId, receiverId] }, // Check if chat already exists
        });

        if (chat) {
          // console.log("Chat already exists:", chat);
          socket.emit("chatId-generated", chat);
        } else {
          // console.log("Creating a new chat...");

          const newChat = new Chat({
            members: [senderId, receiverId],
            admin: senderId,
          });

          await newChat.save();
          // console.log("New chat created:", newChat);
          socket.emit("chatId-generated", newChat);
        }
      } catch (err) {
        console.error("Error creating or finding chat:", err);
        socket.emit("chatId-generated", null);
      }
    });

    socket.on("send-message", async (data) => {
      console.log("sendmessage", data);
      try {
        const { senderId, receiverId, content, chatId } = data;

        console.log("senderId, all text", data);
        const savedMessage = await Message.create({
          senderId,
          receiverId,
          content,
          chatId,
        });

        console.log("savedmessage", savedMessage);

        socket.emit("receive-message", savedMessage);

        console.log("connectedUserIdToSocket", connectedUserIdToSocketId);

        const receiverSocketId = connectedUserIdToSocketId.get(
          receiverId.toString()
        );
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive-message", savedMessage);
        }
      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("message-error", "Failed to send message");
      }
    });

    io.emit("active-users", handleActiveUsers());
    // console.log(" connectedUserIdToSocketId", connectedUserIdToSocketId);
  });
};
