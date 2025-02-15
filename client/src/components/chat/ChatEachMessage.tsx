import { formatDistanceToNow } from "date-fns";
import { useSocket } from "../../store/SocketContext";

const ChatEachMessage = ({
  message,
  chatUser,
}: {
  message: any;
  chatUser: any;
}) => {
  const { content, senderId, createdAt } = message;
  const { user } = useSocket();
  if (!user || !chatUser) return null;
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
            ? user?.name.charAt(0).toUpperCase().toString()
            : chatUser?.name.charAt(0).toUpperCase().toString()}
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

export default ChatEachMessage;
