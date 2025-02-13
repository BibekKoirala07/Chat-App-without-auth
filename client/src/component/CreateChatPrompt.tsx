import { useSocket } from "@/store/SocketContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateChatPrompt = ({ receiverId }: { receiverId: string | null }) => {
  const { socket, user } = useSocket();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const senderId = user?._id || "";

  const handleCreateChat = () => {
    if (!senderId || !receiverId) {
      console.error("Sender or Receiver ID is missing.");
      return;
    }

    setLoading(true);

    socket?.emit("create-chat", { senderId, receiverId }, (data: any) => {
      setLoading(false);
      console.log("data", data);
      if (data._id) {
        navigate(`/chat/random`);
      } else {
        console.error("Failed to create chat.");
      }
    });

    socket?.on("chatId-generated", (data: any) => {
      console.log("data in cahtId generated", data);
      setLoading(false);
      if (data._id) {
        navigate(`/chat/${data._id}`);
      } else {
        console.error("Failed to create chat.");
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Create New Chat</h2>
      <p className="text-gray-400 mb-6">
        Click the button to start a chat with this user.
      </p>

      <button
        onClick={handleCreateChat}
        disabled={loading}
        className={`${
          loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        } text-white py-2 px-6 rounded-lg transition duration-200`}
      >
        {loading ? "Creating..." : "Start Chat"}
      </button>
    </div>
  );
};

export default CreateChatPrompt;
