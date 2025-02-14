import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import backendURL from "../utils/apiRoutes";
import { useSocket } from "../store/SocketContext";
import { useFetchGroup } from "../hooks/hooks";

const EachMessage = ({ message }: { message: any }) => {
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

const GroupContainerHeader = ({
  groupInfo,
  groupActiveMembers,
}: {
  groupInfo: any;
  groupActiveMembers: string[];
}) => {
  if (!groupInfo) return null;
  const totalMembers = groupInfo.members?.length || 0;
  const onlineMembers =
    groupInfo.members?.filter((member: string) =>
      groupActiveMembers.includes(member)
    ).length || 0;
  // there are members in groupInfo and you need to check how many members are online ?
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
          {groupInfo.name.charAt(0).toUpperCase().toString() || "B"}
        </div>
        <div>
          <h2 className="font-medium text-white">{groupInfo.name}</h2>
          <span className="text-sm text-gray-400">
            {onlineMembers > 0
              ? `${onlineMembers} Active now`
              : "No one is Active"}
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

const GroupContainer = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const [messageText, setMessageText] = useState("");
  const [groupMessages, setGroupMessages] = useState<any[]>([]);

  const [groupActiveMembers, setGroupActiveMembers] = useState<string[]>([]);

  console.log("groupActiveMembers", groupActiveMembers);

  const { socket, user } = useSocket();

  const { groupId } = useParams();

  useEffect(() => {
    if (!socket) return;
    if (socket && groupId && user?._id) {
      socket.emit("join-group", { groupId, userId: user?._id });

      socket.on(
        "room-joined",
        (data: { message: string; groupId: string; members: string[] }) => {
          console.log("message in room-joined", data.message);
          setGroupActiveMembers(data.members);
        }
      );

      socket.on("room-joined-notice", (data: any) => {
        console.log("data in room-joined-notice", data);
      });

      socket.on("room-left-notice", (data: { members: string[] }) => {
        setGroupActiveMembers(data.members);
      });
    }
    return () => {
      if (socket && groupId) {
        socket.emit("leave-group", { groupId, userId: user?._id });
      }
    };
  }, [socket, groupId, user]);

  const sendMessage = () => {
    console.log("messageText", messageText);
    const groupMessage = {
      groupId,
      content: messageText,
      senderId: user?._id,
    };
    socket?.emit("send-group-message", groupMessage);
    setMessageText("");
  };

  useEffect(() => {
    const handleReceiveGroupMessage = (data: any) => {
      console.log("Data in receive-group-message:", data);
      const { message } = data;
      if (message.chatId._id.toString() === groupId?.toString()) {
        setGroupMessages((prevMessages: any[]) => [...prevMessages, message]);
        console.log("Message added to group chat");
      }
    };
    socket?.on("receive-group-message", handleReceiveGroupMessage);
  }, [socket, groupId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${backendURL}/api/chats/getAllMessages/${groupId}`
        );
        const data = await response.json();
        if (data.success) {
          setGroupMessages(data.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (groupId) {
      fetchMessages();
    }
  }, [groupId]);

  console.log("groupMessages", groupMessages);

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter" && messageText.trim() !== "") {
      sendMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [groupMessages]);

  if (!groupId) return null;

  const { group } = useFetchGroup(groupId);

  console.log("group", group);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex-none">
        <GroupContainerHeader
          groupInfo={group}
          groupActiveMembers={groupActiveMembers}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {groupMessages.map((message) => (
          <>
            <EachMessage key={Math.random()} message={message} />
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

export default GroupContainer;
