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
          io.emit("active-users", getActiveUsers());

          console.log("User already connected with socket:", existingSocketId);
          // Emit error to the current socket (avoid multiple connections for same user)
          socket.emit("error", {
            message: `User ${userId} is already connected with socket ${existingSocketId}.`,
          });
          return;
        }
      }

      connectedUserIdToSocketId.set(userId.toString(), socket.id);

      console.log("handleActiveUser", getActiveUsers());

      socket.emit("user-setup-complete", user);

      io.emit("active-users", getActiveUsers());
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

        console.log("senderId, all text", data);
        const message = await Message.create({
          senderId,
          receiverId,
          content,
        });

        const savedMessage = await Message.findById(message._id)
          .populate("senderId", "name")
          .populate("receiverId", "name");

        // const updatedChat = await Chat.findByIdAndUpdate(
        //   chatId,
        //   {
        //     latestMessage: {
        //       content,
        //       senderId,
        //       timeStamp: new Date(),
        //     },
        //   },
        //   { new: true }
        // );

        console.log("savedmessage", savedMessage);

        socket.emit("receive-message", { savedMessage });

        console.log("connectedUserIdToSocket", connectedUserIdToSocketId);

        const receiverSocketId = connectedUserIdToSocketId.get(
          receiverId.toString()
        );
        if (receiverSocketId) {
          console.log("receiversocketId", receiverId, receiverSocketId);
          io.to(receiverSocketId).emit("receive-message", {
            savedMessage,
          });
        }
      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("message-error", "Failed to send message");
      }
    });

    socket.on("join-group", async (data) => {
      const { groupId, userId } = data;
      console.log("join-group", groupId, userId);

      const chat = await Chat.findById(groupId).populate("members");
      if (!chat) {
        socket.emit("error", { message: "Group not found" });
        return;
      }

      const isMember = chat.members.some(
        (member) => member._id.toString() === userId
      );

      if (!isMember) {
        socket.emit("error", {
          message: "You are not a member of this group",
        });
        return;
      }

      if (!activeRooms.has(groupId)) {
        activeRooms.set(groupId, new Set());
      }

      const roomMembers = activeRooms.get(groupId);
      if (roomMembers.has(userId)) {
        socket.emit("already-joined", {
          message: "You are already in this group",
        });
        return;
      }

      socket.join(groupId);
      roomMembers.add(userId);

      socket.emit("room-joined", {
        groupId,
        message: `Successfully joined group ${chat.name}`,
        members: getRoomMembers(groupId),
      });

      socket.broadcast.to(groupId).emit("room-joined-notice", {
        userId,
        message: `${userId} has joined the group`,
        members: getRoomMembers(groupId),
      });
      console.log("activeRooms after joining room:", activeRooms);
    });

    socket.on("send-group-message", async (data) => {
      try {
        const { groupId, content, senderId } = data;

        const roomMembers = activeRooms.get(groupId);
        if (!roomMembers?.has(senderId)) {
          socket.emit("error", {
            message: "You must join the group to send messages",
          });
          console.log("user ta room ma nai rahinaxa");
          return;
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
      } catch (error) {
        console.error("Group message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("leave-group", async (data) => {
      try {
        const { groupId, userId } = data;

        const roomMembers = activeRooms.get(groupId);
        if (!roomMembers?.has(userId)) {
          socket.emit("error", { message: "You are not in this group" });
          return;
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
        console.log("activeRooms after leaving", activeRooms);
      } catch (error) {
        console.error("Leave group error:", error);
        socket.emit("error", { message: "Failed to leave group" });
      }
    });

    socket.on("disconnect", () => {
      const disconnectedUserId = findUserIdFromSocketId(socket.id);
      deleteUserIdFromConnectedUserIdToSocketIdMap(disconnectedUserId);
      removeUserFromAllRooms(disconnectedUserId);

      socket.emit("user-disconnected", {
        message: `you ${disconnectedUserId} just disconnected`,
      });
      socket.broadcast.emit("user-disconnected-notice", {
        message: `The user ${disconnectedUserId} just left`,
      });
      console.log("activeRooms after disconnecting", activeRooms);
      console.log("getActiveUsers", getActiveUsers());
      io.emit("active-users", getActiveUsers());
    });

    io.emit("active-users", getActiveUsers());
  });
};
