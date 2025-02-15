const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");

const connectedUserIdToSocketId = new Map();
const activeRooms = new Map();

const findUserIdFromSocketId = (socketId) => {
  for (let [userId, socketIdInMap] of connectedUserIdToSocketId.entries()) {
    if (socketIdInMap === socketId) {
      return userId;
    }
  }
};

const deleteUserIdFromConnectedUserIdToSocketIdMap = (userId) => {
  connectedUserIdToSocketId.delete(userId);
};

const removeUserFromAllRooms = (userId) => {
  for (const [roomId, members] of activeRooms.entries()) {
    if (members.has(userId)) {
      members.delete(userId);
      if (members.size === 0) {
        activeRooms.delete(roomId);
      }
    }
  }
};

const getActiveUsers = () => {
  const arr = [];
  for (let [userId, socketId] of connectedUserIdToSocketId.entries()) {
    arr.push(userId);
  }
  return arr;
};

const getRoomMembers = (roomId) => {
  return Array.from(activeRooms.get(roomId) || []);
};

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("setup", async (data) => {
      try {
        const { name } = data;
        console.log("Setup received for user:", name);
        if (!name) {
          socket.emit("setup-error", { message: "Name is not provided" });
        }

        let user = await User.findOne({ name });

        if (!user) {
          user = await User.create({ name });
        }

        const userId = user._id;

        if (connectedUserIdToSocketId.has(userId.toString())) {
          const existingSocketId = connectedUserIdToSocketId.get(userId);

          if (existingSocketId) {
            io.emit("active-users", getActiveUsers());

            socket.emit("setup-error", {
              message: `User ${userId} is already connected with socket ${existingSocketId}.`,
            });
            return;
          }
        }

        connectedUserIdToSocketId.set(userId.toString(), socket.id);

        socket.emit("user-setup-complete", user);

        io.emit("active-users", getActiveUsers());
      } catch (error) {
        socket.emit("setup-error", {
          message: error.message || "Setup gone wrong",
        });
      }
    });

    socket.on("typing", (data) => {
      const { senderId, receiverId } = data;
      const receiverSocketId = connectedUserIdToSocketId.get(
        receiverId.toString()
      );
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user-typing", {
          senderId,
          receiverId,
          isTyping: true,
        });
      }
    });

    socket.on("stop-typing", (data) => {
      const { senderId, receiverId } = data;
      const receiverSocketId = connectedUserIdToSocketId.get(
        receiverId.toString()
      );
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user-typing", {
          senderId,
          receiverId,
          isTyping: false,
        });
      }
    });

    socket.on("send-message", async (data) => {
      console.log("sendmessage", data);
      try {
        const { senderId, receiverId, content } = data;

        if (!senderId || !receiverId || !content) {
          throw new Error("All credentails not provided");
        }

        const message = await Message.create({
          senderId,
          receiverId,
          content,
        });

        const savedMessage = await Message.findById(message._id)
          .populate("senderId", "name")
          .populate("receiverId", "name");

        socket.emit("receive-message", { savedMessage });

        socket.emit("receive-user-message-for-user-list", {
          senderId,
          receiverId,
          savedMessage,
        });

        const receiverSocketId = connectedUserIdToSocketId.get(
          receiverId.toString()
        );
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive-user-message-for-user-list", {
            receiverId,
            senderId,
            savedMessage,
          });
          io.to(receiverSocketId).emit("receive-message", {
            savedMessage,
          });
        }
      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("send-message-error", {
          message: error.message || "Something went wrong",
        });
      }
    });

    socket.on("join-group", async (data) => {
      try {
        const { groupId, userId } = data;
        console.log("join-group", groupId, userId);

        const chat = await Chat.findById(groupId).populate("members");
        if (!chat) {
          throw new Error("No such GroupId found");
        }

        const isMember = chat.members.some(
          (member) => member._id.toString() === userId
        );

        if (!isMember) {
          throw new Error("You aren't the members of this group");
        }

        if (!activeRooms.has(groupId)) {
          activeRooms.set(groupId, new Set());
        }

        const roomMembers = activeRooms.get(groupId);
        if (roomMembers.has(userId)) {
          throw new Error("You are already member of this group");
        }

        socket.join(groupId);
        roomMembers.add(userId);

        socket.emit("room-joined", {
          groupId,
          message: `Successfully joined group ${chat.name}`,
          members: getRoomMembers(groupId),
        });

        io.to(groupId).emit("room-joined-notice", {
          userId,
          message: `${userId} has joined the group`,
          members: getRoomMembers(groupId),
        });
      } catch (error) {
        socket.emit("join-group-error", {
          message: error.message || "Join group error went wrong",
        });
      }
    });

    socket.on("send-group-message", async (data) => {
      try {
        const { groupId, content, senderId } = data;

        if (!groupId || !content || !senderId) {
          throw new Error("All Credentails not provided");
        }

        const roomMembers = activeRooms.get(groupId);
        if (!roomMembers?.has(senderId)) {
          throw new Error("You must be in this group to send the message");
        }

        const message = await Message.create({
          senderId,
          chatId: groupId,
          content,
        });

        const savedMessage = await Message.findById(message._id)
          .populate("senderId", "name")
          .populate("chatId", "name");

        io.to(groupId).emit("receive-group-message", {
          message: savedMessage,
          activeMembers: getRoomMembers(groupId),
        });

        const chat = await Chat.findByIdAndUpdate(
          groupId,
          {
            latestMessage: {
              content,
              senderId,
              timeStamp: savedMessage.createdAt,
            },
          },
          { new: true }
        ).populate("members", "_id");

        io.to(groupId).emit("receive-group-message-for-group-list", {
          chat,
        });
      } catch (error) {
        socket.emit("send-group-message-error", {
          message: error.message || "Send group message gone wrong",
        });
      }
    });

    socket.on("leave-group", async (data) => {
      try {
        const { groupId, userId } = data;

        if (!groupId || !userId) {
          throw new Error("Please provide all credentails");
        }

        const roomMembers = activeRooms.get(groupId);
        if (!roomMembers?.has(userId)) {
          throw new Error("You are not a member of this group");
        }

        socket.leave(groupId);
        roomMembers.delete(userId);

        if (roomMembers.size === 0) {
          activeRooms.delete(groupId);
        }

        socket.emit("room-left", {
          groupId,
          message: "Successfully left the group",
        });

        io.to(groupId).emit("room-left-notice", {
          userId,
          message: `A user has left the group`,
          members: getRoomMembers(groupId),
        });
      } catch (error) {
        socket.emit("leave-group-error", {
          message: error.message || "Leave Group gone wrong",
        });
      }
    });

    socket.on("disconnect", () => {
      try {
        const disconnectedUserId = findUserIdFromSocketId(socket.id);
        deleteUserIdFromConnectedUserIdToSocketIdMap(disconnectedUserId);
        removeUserFromAllRooms(disconnectedUserId);

        activeRooms.forEach((members, roomId) => {
          if (members.has(disconnectedUserId)) {
            io.to(roomId).emit("room-left-notice", {
              userId: disconnectedUserId,
              message: `User ${disconnectedUserId} has left the room.`,
              members: getRoomMembers(roomId),
            });
          }
        });

        socket.broadcast.emit("user-disconnected-notice", {
          message: `The user ${disconnectedUserId} just left`,
        });
        io.emit("active-users", getActiveUsers());
      } catch (error) {
        socket.emit("disconnect-error", {
          message: error.message || "Disconnect user gone wrong",
        });
      }
    });
  });
};
