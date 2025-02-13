import { useParams } from "react-router-dom";

const backendURL =
  import.meta.env.NODE_ENV === "production"
    ? import.meta.env.VITE_PROD_BACKEND_URI
    : import.meta.env.VITE_DEV_BACKEND_URI;

import { useEffect, useState } from "react";
import { useSocket } from "@/store/SocketContext";
import { Message } from "@/types/types";
import EachMessage from "./EachMessage";
const RightSideBox = ({ selectedUser }: { selectedUser: any }) => {
  const [messageText, setMessageText] = useState("");

  const { socket, user } = useSocket();
  const { chatId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chatId || !socket || !user) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${backendURL}/api/chats/${chatId}/messages?page=${page}&limit=10`
        );
        const data = await response.json();

        console.log("data", data);

        if (data.data.length === 0) {
          setHasMore(false);
        } else {
          setMessages((prev: any) => [...data.data, ...prev]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (user._id && socket && chatId) {
      console.log("message fetched at all.");
      fetchMessages();
    }
  }, [chatId, page, socket]);

  const loadMoreMessages = () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    setPage((prev) => prev + 1);
    setIsLoading(false);
  };

  console.log("loadMessage", loadMoreMessages);

  useEffect(() => {
    if (!socket) return;
    socket.on("receive-message", (newMessage) => {
      console.log("newMessage", newMessage);
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [socket]);

  const sendMessage = () => {
    console.log("send message top");
    if (!user?._id) return;
    if (!socket) return;
    if (!messageText.trim() || !chatId) return;
    console.log("send message after");

    const messageData = {
      chatId,
      content: messageText,
      senderId: user._id,
      receiverId: selectedUser._id,
      timestamp: new Date().toISOString(),
    };

    console.log("messageData", messageData);

    socket.emit("send-message", messageData); // Emit event to server
    setMessageText(""); // Clear input field
  };

  console.log("all Messages", messages);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
            {selectedUser ? selectedUser.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <h2 className="font-medium text-white">
              {selectedUser ? selectedUser.name : "Select a user"}
            </h2>
            <span className="text-sm text-gray-400">
              {selectedUser ? "Active now" : "Not Active"}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <EachMessage key={message._id} message={message} />
        ))}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button
            onClick={sendMessage}
            onKeyDown={handleKeyDown}
            disabled={messageText.length == 0}
            className="p-2 bg-blue-600 disabled:bg-gray-600 hover:bg-blue-700 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightSideBox;
