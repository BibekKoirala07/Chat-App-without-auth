import { createContext, useContext, useEffect, useRef, useState } from "react";
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

  // Add connection status tracking
  const [isConnected, setIsConnected] = useState(false);
  const connectionAttemptRef = useRef(false);

  // Cleanup function for socket
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [socket]);

  // Modified connection logic
  useEffect(() => {
    if (user && !isConnected && !connectionAttemptRef.current) {
      connectSocket(user.name);
    }
  }, [user, isConnected]);

  const connectSocket = (name: string) => {
    if (connectionAttemptRef.current || isConnected) {
      console.log("Connection already in progress or socket already connected");
      return;
    }

    connectionAttemptRef.current = true;

    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to server:", newSocket.connected);
      setIsConnected(true);
      newSocket.emit("setup", { name });
    });

    newSocket.on("user-setup-complete", (userData: User) => {
      console.log("User setup complete", userData);
      if (userData) {
        localStorage.setItem("chatUser", JSON.stringify(userData));
        setUser(userData);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      connectionAttemptRef.current = false;
      setSocket(null);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
      connectionAttemptRef.current = false;
    });

    setSocket(newSocket);
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
