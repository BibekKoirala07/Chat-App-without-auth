import { differenceInMinutes, formatDistanceToNow } from "date-fns";
import { useSocket } from "../../store/SocketContext";

const ChatEachMessage = ({
  message,
  chatUser,
  previousMessage,
}: {
  message: any;
  chatUser: any;
  previousMessage: any; // Track the time of the previous message
}) => {
  const { content, senderId, createdAt } = message;
  const { user } = useSocket();
  if (!user || !chatUser) return null;
  const isThisGuyASender = senderId._id.toString() == user?._id.toString();
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  const timeFrameInMinutes = 2;
  const isSameSender =
    previousMessage && previousMessage.senderId._id === senderId._id;

  const isWithinTimeFrame =
    previousMessage &&
    differenceInMinutes(
      new Date(createdAt),
      new Date(previousMessage.createdAt)
    ) <= timeFrameInMinutes;

  const shouldHideTimestamp = isSameSender && isWithinTimeFrame;

  const isFirstMessage =
    !isWithinTimeFrame ||
    !previousMessage ||
    previousMessage.senderId._id !== senderId._id;

  return (
    <div
      className={`flex gap-4 mb-0.5   ${
        !shouldHideTimestamp ? "my-" : "my- "
      }   ${isFirstMessage ? " mt-4" : "mb-0"} ${
        isThisGuyASender ? "flex-row-reverse" : ""
      }`}
    >
      {!shouldHideTimestamp ? (
        <div className="flex-shrink-0 ">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
            {isThisGuyASender
              ? user?.name.charAt(0).toUpperCase().toString()
              : chatUser?.name.charAt(0).toUpperCase().toString()}
          </div>
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full "></div>
      )}
      <div
        className={`flex  flex-col ${
          user._id == senderId._id ? "items-end" : "items-start"
        } max-w-[70%]`}
      >
        {/* <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-400">{"B"}</span>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div> */}

        {!shouldHideTimestamp && (
          <div className="flex   items-center gap-2 mb-1.5">
            <p className="text-sm  text-gray-400">
              {isThisGuyASender ? "You" : chatUser?.name}
            </p>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
        )}
        <div
          className={`rounded-xl py-1.5 h-full  px-7 ${
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
