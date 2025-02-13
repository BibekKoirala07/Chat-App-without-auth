import { useSocket } from "@/store/SocketContext";
import { Message } from "@/types/types";
import { format } from "date-fns";

const EachMessage = ({ message }: { message: Message }) => {
  const { senderId, receiverId, content, createdAt, updatedAt } = message;
  const { user } = useSocket();
  const isUser = typeof senderId !== "string" && senderId._id === user?._id;
  const timeStamp = createdAt || updatedAt;
  const formattedTime = timeStamp
    ? format(new Date(timeStamp), "MMM dd, yyyy HH:mm")
    : "real";
  return (
    <div className={`flex gap-3 mb-6 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
          {typeof receiverId !== "string"
            ? receiverId.name.charAt(0).toUpperCase()
            : "?"}
        </div>
      </div>
      <div
        className={`flex flex-col ${
          isUser ? "items-end" : "items-start"
        } max-w-[70%]`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-400">
            {typeof senderId !== "string"
              ? senderId.name.charAt(0).toUpperCase()
              : "?"}
          </span>
          <span className="text-xs text-gray-500">{formattedTime}</span>
        </div>
        <div
          className={`rounded-2xl p-2 px-5 ${
            isUser
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

export default EachMessage;
