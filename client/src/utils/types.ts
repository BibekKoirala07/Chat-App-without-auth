export interface Message {
  _id: string;
  senderId: string | { _id: string; name: string };
  receiverId: string | { _id: string; name: string };
  content: string;
  chatId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  _id: string;
  members: string[];
  latestMessage: {
    content: string;
    senderId: string;
    timeStamp: string;
  };
  isGroup: boolean;
  admin: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
