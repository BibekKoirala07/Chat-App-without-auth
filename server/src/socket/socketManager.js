class MessageHandler {
  constructor(io) {
    this.io = io;
    this.activeUsers = new Map(); // userId -> socketId
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

  async getChatHistory(chatId) {
    try {
      const messages = await Message.find({ chatId })
        .sort({ createdAt: 1 })
        .limit(50);
      return messages;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  }
}
