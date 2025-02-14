const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    receiverId: {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    content: {
      type: String,
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
