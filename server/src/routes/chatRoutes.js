const express = require("express");
const Message = require("../models/Message");
const chatRoutes = express.Router();

chatRoutes.get("/:chatId/messages", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Default: page 1, 10 messages per page

    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments({ chatId });

    return res.json({
      success: true,
      data: messages,
      totalPages: Math.ceil(totalMessages / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error hoina hola" });
  }
});

module.exports = chatRoutes;
