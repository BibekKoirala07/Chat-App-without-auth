import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import backendURL from "../utils/apiRoutes";
import { useSocket } from "../store/SocketContext";
import { useFetchGroup } from "../hooks/hooks";
import GroupContainerHeader from "./groups/GroupContainerHeader";
import GroupEachMessage from "./groups/GroupEachMessage";
import GroupSendMessageFooter from "./groups/GroupSendMessageFooter";

const GroupContainer = () => {
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [hasMore, setHasMore] = useState(true);

  const [groupMessages, setGroupMessages] = useState<any[]>([]);

  const [groupActiveMembers, setGroupActiveMembers] = useState<string[]>([]);

  console.log("groupActiveMembers", groupActiveMembers);

  const { socket, user } = useSocket();

  const { groupId } = useParams();

  const { group } = useFetchGroup(groupId);

  const limit = 5;

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

  const fetchMessages = async (pageNum: number) => {
    try {
      const messageResponse = await fetch(
        `${backendURL}/api/chats/getAllMessages/${groupId}?page=${pageNum}&limit=${limit}`
      );
      const messageData = await messageResponse.json();
      if (messageResponse.ok) {
        const { data, pagination } = messageData;
        const { totalPages, currentPage } = pagination;
        const orderedMessages = [...data].reverse();
        console.log("totalPages", totalPages, currentPage);
        if (currentPage == 1) {
          setGroupMessages(orderedMessages);
          console.log("currentPage", currentPage);
          setTimeout(scrollToBottom, 20);
        } else {
          setGroupMessages((prevMessages) => [
            ...orderedMessages,
            ...prevMessages,
          ]);
        }
        setHasMore(currentPage < totalPages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (!groupId) return;
    setGroupMessages([]);
    setPage(1);
    fetchMessages(1);
  }, [groupId]);

  // useEffect(() => {
  //   scrollToBottom();
  // }, [groupMessages]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      if (chatContainer.scrollTop < 50 && !isLoadingMore && hasMore) {
        scrollTimerRef.current = setTimeout(() => {
          setIsLoadingMore(true);
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchMessages(nextPage).finally(() => {
              setIsLoadingMore(false);
            });
            return nextPage;
          });
        }, 1000); // Wait for 1 second at the top before loading
      }
    };

    chatContainer.addEventListener("scroll", handleScroll);
    return () => {
      chatContainer.removeEventListener("scroll", handleScroll);
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [isLoadingMore, hasMore, groupId, user?._id]);

  if (!groupId) return null;

  console.log("group", group);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex-none">
        <GroupContainerHeader
          groupInfo={group}
          groupActiveMembers={groupActiveMembers}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
        {hasMore && (
          <div className="flex justify-center items-center py-4">
            <div className="w-12 h-12 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
          </div>
        )}

        {!hasMore && (
          <div className="flex justify-center items-center py-4">
            <p className="text-gray-500">No more messages to load.</p>
          </div>
        )}
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
