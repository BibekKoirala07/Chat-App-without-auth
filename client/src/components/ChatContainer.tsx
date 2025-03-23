import { useEffect, useRef, useState } from "react";

import { useSocket } from "../store/SocketContext";
import { useParams } from "react-router-dom";
import ChatContainerHeader from "./chat/ChatContainerHeader";
import ChatEachMessage from "./chat/ChatEachMessage";
import ChatSendMessageFooter from "./chat/ChatSendMessageFooter";
import { useFetchUser } from "../hooks/hooks";

const backendUrl =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PROD_BACKEND_URI
    : import.meta.env.VITE_DEV_BACKEND_URI;

const ChatContainer = () => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [isTyping, setIsTyping] = useState(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  console.log("page", page);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { userId } = useParams();
  const { socket, user } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);

  const { user: chatUser } = useFetchUser(userId);
  const limit = 10;

  const fetchMessages = async (pageNum: number) => {
    const messageResponse = await fetch(
      `${backendUrl}/api/messages/${userId}?senderId=${user?._id}&page=${pageNum}&limit=${limit}`
    );
    if (!messageResponse.ok) throw new Error("Failed to fetch messages");
    const messageData = await messageResponse.json();
    // console.log("message in chatContainer", messageData);

    if (messageResponse.ok) {
      const { data, pagination } = messageData;
      // console.log("data in chat Group", data, pagination);
      const { totalPages, currentPage } = pagination;
      const orderedMessages = [...data].reverse();
      if (currentPage == 1) {
        setMessages(orderedMessages);
        // console.log("currentPage", currentPage);
        setTimeout(scrollToBottom, 20);
      } else {
        setMessages((prevMessages) => [...orderedMessages, ...prevMessages]);
      }

      setHasMore(currentPage < totalPages);
    }
  };

  // console.log("messages", messages);

  useEffect(() => {
    if (!userId || !user?._id) return;
    setMessages([]);
    setPage(1);
    fetchMessages(1);
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("user-typing", (data: any) => {
      const { receiverId, isTyping } = data;
      if (receiverId == user?._id) {
        console.log("isTyping", isTyping);
        // setIsTyping(isTyping);
      }
    });

    socket.on("receive-message", (data: any) => {
      console.log("data in recieve message", data);
      const { savedMessage } = data;
      setMessages((prevMessages) => [...prevMessages, savedMessage]);
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [socket]);

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
  }, [isLoadingMore, hasMore, userId, user?._id]);

  if (!userId) return null;
  if (!user?._id) return null;

  // useEffect(() => {
  //   // if (isTyping) {
  //   //   // const typingSound = new Audio("/typing.mp3"); // Path to your typing sound file
  //   //   // typingSound.play();
  //   // }
  // }, [isTyping]);

  return (
    <div className="flex flex-col h-screen  max-w-screen bg-gray-900">
      <div className="flex-none fixed">
        <ChatContainerHeader chatUser={chatUser} />
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-0"
      >
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
        {messages.map((message, index: number) => {
          let previousMessage;
          if (index.toString() != "0") {
            previousMessage = messages[index - 1];
          }
          return (
            <div key={message._id} className="space-y-0">
              <ChatEachMessage
                chatUser={chatUser}
                previousMessage={previousMessage}
                message={message}
              />
              <div ref={messagesEndRef} />
            </div>
          );
        })}
        {/* {isTyping && (
          <div className="flex mb-10 justify-start items-center space-x-3 py-2">
            <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse delay-75"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse delay-150"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse delay-225"></div>
          </div>
        )} */}
      </div>

      <ChatSendMessageFooter isTyping={isTyping} setIsTyping={setIsTyping} />
    </div>
  );
};

export default ChatContainer;

// Check if the current message sender is the same as the previous message sender
