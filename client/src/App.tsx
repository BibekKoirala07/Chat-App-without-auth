import { useEffect, useState } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import NamePrompt from "./component/NamePrompt";
import { useSocket } from "./store/SocketContext";
import LeftSideBox from "./component/LeftSideBox";
import RightSideBox from "./component/RightSideBox";
import WelcomeMessage from "./component/WelcomeMessage";
import "./App.css";
import ClickUserPrompt from "./component/ClickUserPrompt";
import CreateChatPrompt from "./component/CreateChatPrompt";

const backendURL =
  import.meta.env.NODE_ENV === "production"
    ? import.meta.env.VITE_PROD_BACKEND_URI
    : import.meta.env.VITE_DEV_BACKEND_URI;

const App = () => {
  const { user } = useSocket();
  const navigate = useNavigate();
  const { socket, connectSocket } = useSocket();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);
  const [error, setError] = useState<string | null>(null);

  console.log(loading, error, activeUsers, setActiveUsers);

  const [selectedReceiver, setSelectedReceiver] = useState<string | null>("");

  const handleChatChange = (receiverId: string) => {
    console.log("set selectedChat", receiverId);
    setSelectedReceiver(receiverId);
    navigate("/chat");
  };

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 });

  const { chatId } = useParams();

  const handleNameSubmit = (name: string) => {
    console.log("handlesubmit");
    connectSocket(name);
  };

  console.log("user", user);

  useEffect(() => {
    socket?.on("active-users", (data) => {
      console.log("data", data);
    });
  }, []);

  useEffect(() => {
    console.log("useEffect in users fetching");
    if (!user?._id) return;
    console.log("useEffect in after fetching");

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${backendURL}/api/users/getAllUsers/${user._id}`
        );

        const data = await response.json();
        console.log("data", data);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        setUsers(data.data); // Assuming the API returns { data: [...] }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, socket]);

  const selectedReceiverUser = users.find(
    (user) => user._id.toString() === selectedReceiver?.toString()
  );

  // console.log("seelctedREcie", selectedReceiverUser);

  return (
    <div>
      {!user && <NamePrompt onSubmit={handleNameSubmit} />}
      <Routes>
        <Route
          path="/"
          element={
            <div className="h-screen flex">
              {(!isMobile || !chatId) && (
                <div
                  className={`${
                    isTabletOrMobile ? "w-full" : "w-[400px]"
                  } border-r border-gray-800`}
                >
                  <LeftSideBox
                    users={users}
                    handleChatChange={handleChatChange}
                  />
                </div>
              )}

              {!isMobile && !chatId && (
                <div className="flex-1">
                  {chatId ? (
                    <RightSideBox selectedUser={selectedReceiverUser} />
                  ) : (
                    !isMobile && <ClickUserPrompt />
                  )}
                </div>
              )}

              {!isMobile && chatId && (
                <div className="flex-1">
                  {chatId ? (
                    <RightSideBox selectedUser={selectedReceiverUser} />
                  ) : (
                    !isMobile && <WelcomeMessage />
                  )}
                </div>
              )}
            </div>
          }
        />

        <Route
          path="/chat"
          element={
            <div className="h-screen flex">
              {!isMobile && (
                <div
                  className={`${
                    isTabletOrMobile ? "w-full" : "w-[400px]"
                  } border-r border-gray-800`}
                >
                  <LeftSideBox
                    users={users}
                    handleChatChange={handleChatChange}
                  />
                </div>
              )}

              {true && (
                <div className="flex-1">
                  <CreateChatPrompt receiverId={selectedReceiver} />
                </div>
              )}
            </div>
          }
        />

        <Route
          path="/chat/:chatId"
          element={
            <div className="h-screen flex">
              {!isMobile && (
                <div
                  className={`${
                    isTabletOrMobile ? "w-full" : "w-[400px]"
                  } border-r border-gray-800`}
                >
                  <LeftSideBox
                    users={users}
                    handleChatChange={handleChatChange}
                  />
                </div>
              )}

              {true && (
                <div className="flex-1">
                  <RightSideBox selectedUser={selectedReceiverUser} />
                </div>
              )}
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
