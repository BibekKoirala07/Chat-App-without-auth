import { useEffect, useRef, useState } from "react";

import { useSocket } from "../store/SocketContext";
import { useParams } from "react-router-dom";
import ChatContainerHeader from "./chat/ChatContainerHeader";
import ChatEachMessage from "./chat/ChatEachMessage";
import ChatSendMessageFooter from "./chat/ChatSendMessageFooter";

const backendUrl =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PROD_BACKEND_URI
    : import.meta.env.VITE_DEV_BACKEND_URI;

const ChatContainer = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const { userId } = useParams();
  const [chatUser, setChatUser] = useState();
  const { socket, user } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      const response = await fetch(`${backendUrl}/api/users/getUser/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");

      const data = await response.json();
      setChatUser(data.data);

      console.log("data in chatContainer", data);

      const messageResponse = await fetch(
        `${backendUrl}/api/messages/${userId}?senderId=${user?._id}`
      );
      if (!messageResponse.ok) throw new Error("Failed to fetch messages");
      const messageData = await messageResponse.json();
      console.log("message in chatContainer", messageData);
      setMessages(messageData.data);
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", (data: any) => {
      console.log("data in recieve message", data);
      const { savedMessage } = data;
      setMessages((prevMessages) => [...prevMessages, savedMessage]);
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [socket]);

  if (!user?._id) return null;
  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex-none">
        <ChatContainerHeader chatUser={chatUser} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message._id}>
            <ChatEachMessage chatUser={chatUser} message={message} />
            <div ref={messagesEndRef} />
          </div>
        ))}
      </div>

      <ChatSendMessageFooter />
    </div>
  );
};

export default ChatContainer;
