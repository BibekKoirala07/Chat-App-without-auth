import { useSocket } from "../../store/SocketContext";

const GroupEachMessage = ({ message }: { message: any }) => {
  const { user } = useSocket();
  const isOwnMessage = message.senderId._id === user?._id;
  return (
    <div
      className={`flex gap-3 mb-6 ${isOwnMessage ? "flex-row-reverse" : ""}`}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
          {message.senderId.name[0].toUpperCase()}
        </div>
      </div>
      <div
        className={`flex flex-col ${
          isOwnMessage ? "items-end" : "items-start"
        } max-w-[70%]`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-400">{message.senderId.name}</span>
          <span className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>
        <div
          className={`rounded-xl p-1.5 px-7 ${
            isOwnMessage
              ? "bg-blue-600 text-white rounded-tr-none"
              : "bg-gray-800 text-white rounded-tl-none"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default GroupEachMessage;
