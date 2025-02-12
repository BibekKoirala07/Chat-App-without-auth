import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { io } from "socket.io-client";
import LeftSideBox from "./component.tsx/LeftSideBox";
import RightSideBox from "./component.tsx/RightSideBox";
import "./App.css";
import WelcomeMessage from "./component.tsx/WelcomeMessage";
import NamePrompt from "./component.tsx/NamePrompt";

const socket = io("http://localhost:5000");

const ChatLayout = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 });
  const { chatId } = useParams();

  return (
    <div className="h-screen flex">
      {(!isMobile || !chatId) && (
        <div
          className={`${
            isTabletOrMobile ? "w-full" : "w-[400px]"
          } border-r border-gray-800`}
        >
          <LeftSideBox />
        </div>
      )}

      {(!isMobile || chatId) && (
        <div className="flex-1">
          {chatId ? <RightSideBox /> : !isMobile && <WelcomeMessage />}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("chatUser");
    return savedUser ? JSON.parse(savedUser) : "null";
  });

  const handleNameSubmit = async (name: string) => {
    try {
      socket.emit("setup", { name });

      socket.on("user-setup-complete", (userData) => {
        const newUser = {
          id: userData.userId,
          name: name,
        };

        localStorage.setItem("chatUser", JSON.stringify(newUser));
        setUser(newUser);

        socket.emit("user-connected", newUser.id);
      });
    } catch (error) {
      console.error("Error setting up user:", error);
    }
  };

  useEffect(() => {
    if (user) {
      socket.emit("user-connected", user.id);
    }

    return () => {
      socket.off("user-setup-complete");
    };
  }, []);

  // Export socket instance for use in other components
  // window.chatSocket = socket;

  return (
    <BrowserRouter>
      {!user && <NamePrompt onSubmit={handleNameSubmit} />}
      <Routes>
        <Route path="/" element={<ChatLayout />}>
          <Route path="chat/:chatId" element={<ChatLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
