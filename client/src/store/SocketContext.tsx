import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const socketUrl =
  import.meta.env.NODE_ENV === "production"
    ? import.meta.env.VITE_PROD_BACKEND_URI
    : import.meta.env.VITE_DEV_BACKEND_URI;

interface User {
  name: string;
  _id: string;
}

interface SocketContextType {
  socket: Socket | null;
  user: User | null;
  connectSocket: (name: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("chatUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      connectSocket(user.name);
    }
  }, [user]);

  const connectSocket = (name: string) => {
    if (!socket) {
      const newSocket = io(socketUrl);

      newSocket.on("connect", () => {
        console.log("Connected to server:", newSocket.connected);
        newSocket.emit("setup", { name });
      });

      newSocket.on("user-setup-complete", (userData) => {
        // console.log("User setup complete", userData);
        localStorage.setItem("chatUser", JSON.stringify(userData));
        newSocket.emit("user-connected", userData.userId);
      });

      setSocket(newSocket);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, user, connectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
