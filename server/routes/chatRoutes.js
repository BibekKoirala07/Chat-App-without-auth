// routes/chat.js
const express = require("express");
const chatRoutes = express.Router();
const Chat = require("../models/Chat");
const Message = require("../models/Message");

chatRoutes.get("/getChat/:id", async (req, res) => {
  const { id } = req.params;
  const chat = await Chat.findById(id).lean();
  if (!chat) {
    return res.status(400).json({ success: false, error: "No result found" });
  }
  return res.status(200).json({ success: true, data: chat });
});

chatRoutes.get("/getAllChats/:senderId", async (req, res) => {
  const { senderId } = req.params;

  if (!senderId) {
    return res.status(400).json({ error: "senderId is required" });
  }

  try {
    const chats = await Chat.find({
      $or: [{ members: senderId }, { isGroup: true, members: senderId }],
    })
      .populate("members", "name")
      .populate("latestMessage.senderId", "name")
      .sort({ "latestMessage.timeStamp": -1 });

    return res.json({ success: true, data: chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

chatRoutes.post("/create/:senderId", async (req, res) => {
  const { senderId } = req.params;
  const { members, groupName } = req.body;

  if (!senderId || !members || !groupName) {
    return res
      .status(400)
      .json({ error: "SenderId and at least two members are required" });
  }

  try {
    // Ensure senderId is included in members for consistency
    if (!members.includes(senderId)) {
      members.push(senderId);
    }

    const newChat = new Chat({
      name: groupName,
      members: members,
      isGroup: true,
      admin: senderId,
      latestMessage: {
        content: "",
        senderId: senderId,
        timeStamp: new Date(),
      },
    });

    const savedChat = await newChat.save();

    return res.status(201).json({ success: true, data: savedChat });
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ error: "Failed to create chat" });
  }
});

chatRoutes.get("/getAllMessages/:chatId", async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    return res.status(400).json({ error: "chatId is required" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const messages = await Message.find({ chatId })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "name");

    const totalMessages = await Message.countDocuments({ chatId });

    return res.json({
      success: true,
      data: messages,
      pagination: {
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = chatRoutes;
