const Message = require("../models/Message");

class MessageHandler {
  constructor(io) {
    this.io = io;
    this.activeUsers = new Map();
  }

  async saveMessage(messageData) {
    try {
      const message = new Message(messageData);
      await message.save();
      return message;
    } catch (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  }

  async getChatHistory(chatId, limit = 50) {
    try {
      const messages = await Message.find({ chatId })
        .sort({ createdAt: 1 })
        .limit(limit);
      return messages;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  }
}

module.exports = MessageHandler;
