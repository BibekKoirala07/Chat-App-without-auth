import { useState } from "react";
import { useSocket } from "../../store/SocketContext";
import { useParams } from "react-router-dom";

const ChatSendMessageFooter = () => {
  const { userId } = useParams();
  const { socket, user } = useSocket();
  const [messageText, setMessageText] = useState("");
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

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter" && messageText.trim() !== "") {
      sendMessage();
    }
  };

  return (
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
  );
};

export default ChatSendMessageFooter;
