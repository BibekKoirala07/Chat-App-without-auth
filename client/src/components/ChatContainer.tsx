import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { useSocket } from "../store/SocketContext";
import { useParams } from "react-router-dom";

const backendUrl =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PROD_BACKEND_URI
    : import.meta.env.VITE_DEV_BACKEND_URI;

const EachMessage = ({
  message,
  chatUser,
}: {
  message: any;
  chatUser: any;
}) => {
  const { content, senderId, createdAt } = message;
  const { user } = useSocket();
  if (!user) return null;
  const isThisGuyASender = senderId._id.toString() == user?._id.toString();
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  return (
    <div
      className={`flex gap-3 mb-6 ${
        isThisGuyASender ? "flex-row-reverse" : ""
      }`}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
          {isThisGuyASender
            ? user.name.charAt(0).toUpperCase().toString()
            : chatUser.name.charAt(0).toUpperCase().toString()}
        </div>
      </div>
      <div
        className={`flex flex-col ${
          true ? "items-end" : "items-start"
        } max-w-[70%]`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-400">{"B"}</span>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>
        <div
          className={`rounded-xl p-1.5 px-7 ${
            isThisGuyASender
              ? "bg-blue-600 text-white rounded-tr-none"
              : "bg-gray-800 text-white rounded-tl-none"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
};

const ChatContainerHeader = ({ chatUser }: { chatUser: any }) => {
  const { activeUsers } = useSocket();
  const isUserActive = chatUser && activeUsers.includes(chatUser._id);
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
          {chatUser?.name ? chatUser.name.charAt(0).toUpperCase() : "?"}
        </div>
        <div>
          <h2 className="font-medium text-white">
            {chatUser?.name || "Select a user"}
          </h2>
          <span className="text-sm text-gray-400">
            {isUserActive ? "Active now" : "Not Active"}
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
  );
};

// const ChatContainerSendMessageSection = () => {
//   return <div>real</div>;
// };

const ChatContainer = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const { userId } = useParams();
  const [messageText, setMessageText] = useState("");
  const [chatUser, setChatUser] = useState();
  const { socket } = useSocket();

  const [messages, setMessages] = useState<any[]>([]);

  const { user } = useSocket();

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      const response = await fetch(`${backendUrl}/api/users/getUser/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");

      const data = await response.json();
      setChatUser(data.data);

      const messageResponse = await fetch(
        `${backendUrl}/api/messages/${userId}?senderId=${user?._id}`
      );
      if (!messageResponse.ok) throw new Error("Failed to fetch messages");
      const messageData = await messageResponse.json();
      setMessages(messageData.data);
    };
    fetchData();
  }, [userId]);

  const sendMessage = () => {
    if (!socket) return;
    if (!messageText.trim()) return;

    const newMessage = {
      senderId: user?._id,
      receiverId: userId,
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    console.log("new Message", newMessage);

    socket.emit("send-message", newMessage);
    setMessageText("");
  };

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

  const handleKeyDown = (event: any) => {
    console.log("Here");
    if (event.key === "Enter" && messageText.trim() !== "") {
      sendMessage();
    }
  };

  if (!user?._id) return null;
  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex-none">
        <ChatContainerHeader chatUser={chatUser} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <>
            <EachMessage
              key={message._id}
              chatUser={chatUser}
              message={message}
            />
            <div ref={messagesEndRef} />
          </>
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
            onKeyDown={handleKeyDown}
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

export default ChatContainer;
