const express = require("express");
const messageRoutes = express.Router();
const Message = require("../models/Message");

messageRoutes.get("/:receiverId", async (req, res) => {
  try {
    const { senderId } = req.query;
    const { receiverId } = req.params;

    if (!senderId) {
      return res.status(400).json({ error: "Sender ID is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "name")
      .populate("receiverId", "name");

    // console.log("message", messages);

    return res.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

messageRoutes.post("/send", async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text.trim()) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create a new message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = messageRoutes;
