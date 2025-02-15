import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import backendURL from "../utils/apiRoutes";
import { useSocket } from "../store/SocketContext";
import { useFetchGroup } from "../hooks/hooks";
import GroupContainerHeader from "./groups/GroupContainerHeader";
import GroupEachMessage from "./groups/GroupEachMessage";
import GroupSendMessageFooter from "./groups/GroupSendMessageFooter";

const GroupContainer = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
          <div key={message._id}>
            <GroupEachMessage message={message} />
            <div ref={messagesEndRef} />
          </div>
        ))}
      </div>

      <GroupSendMessageFooter />
    </div>
  );
};

export default GroupContainer;
