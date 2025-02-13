import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../store/SocketContext";

const WelcomeMessage = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const { socket, user } = useSocket();
  const navigate = useNavigate();

  const handleStartChat = () => {
    if (socket) {
      socket.emit("generate-chatId", { senderId: user?._id });

      socket.on("chatId-generated", (generatedChatId: string) => {
        setChatId(generatedChatId);
        navigate(`/chat/${generatedChatId}`);
      });
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-900">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Welcome to Chat</h2>
        <p className="text-gray-400 mb-6">
          Select a conversation to start messaging
        </p>

        {/* Beautiful button */}
        <button
          className="px-9 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none transition duration-200"
          onClick={handleStartChat}
        >
          Start Chatting
        </button>

        {chatId && (
          <p className="mt-4 text-sm text-gray-300">
            Chat ID: <strong>{chatId}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default WelcomeMessage;
