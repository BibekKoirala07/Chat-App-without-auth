export interface Message {
  _id: string;
  senderId: string; // This will be the ObjectId as a string from MongoDB
  receiverId: string; // This will be the ObjectId as a string from MongoDB
  content: string; // The content of the message
  chatId: string; // The chatId is also an ObjectId as a string
  isRead: boolean; // Boolean indicating if the message has been read
  createdAt: string; // Timestamp of when the message was created
  updatedAt: string; // Timestamp of when the message was last updated
}

export interface Chat {
  _id: string; // MongoDB ObjectId as a string
  members: string[]; // Array of User ObjectIds (strings)
  latestMessage: {
    content: string; // Content of the latest message
    senderId: string; // Sender's User ObjectId (string)
    timeStamp: string; // Timestamp of the latest message (ISO string)
  };
  isGroup: boolean; // Whether the chat is a group chat
  admin: string; // Admin User ObjectId (string)
  createdAt: string; // Timestamp of when the chat was created
  updatedAt: string; // Timestamp of when the chat was last updated
}

export interface User {
  _id: string; // MongoDB ObjectId as a string
  name: string; // The name of the user
  createdAt: string; // Timestamp of when the user was created (ISO string)
  updatedAt: string; // Timestamp of when the user was last updated (ISO string)
}
