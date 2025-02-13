import { useState } from "react";
import { Search, ExternalLink } from "lucide-react";
import { useParams } from "react-router-dom";
import { useSocket } from "@/store/SocketContext";

const LeftSideBox = ({
  users,
  handleChatChange,
}: {
  users: any[];
  handleChatChange: (chatId: string) => void;
}) => {
  const { activeUsers } = useSocket();

  const [activeTab, setActiveTab] = useState("Friends");

  const [searchTerm, setSearchTerm] = useState("");

  const { chatId } = useParams();

  // console.log("users", users);
  // console.log("socket", socket);

  // useEffect(() => {
  //   const fetchMessages = async () => {
  //     try {
  //       setLoading(true); // Set loading to true before fetch starts
  //       setError(null); // Reset error state
  //       const response = await fetch(`/api/chat/${chatId}`);

  //       // Simulating different states:
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch messages");
  //       }

  //       const data = await response.json(); // Assuming the response contains chat messages
  //       setMessages(data.messages); // Set the messages state
  //     } catch (err: any) {
  //       setError(err.message || "An error occurred while fetching the chat.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (chatId) {
  //     fetchMessages();
  //   }
  // }, [chatId]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Chats</h1>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ExternalLink className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="mt-6 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          className="w-full bg-gray-100 p-3 pl-12 pr-4 rounded-lg 
                     placeholder:text-gray-500 focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Search..."
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setActiveTab("Friends")}
          className={`flex-1 p-3 rounded-lg font-medium transition-colors
                     ${
                       activeTab === "Friends"
                         ? "bg-blue-600 text-white"
                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                     }`}
        >
          Friends
        </button>
        <button
          onClick={() => setActiveTab("Groups")}
          className={`flex-1 p-3 rounded-lg font-medium transition-colors
                     ${
                       activeTab === "Groups"
                         ? "bg-blue-600 text-white"
                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                     }`}
        >
          Groups
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => handleChatChange(user._id)}
            className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors
                ${
                  user.chatId !== null &&
                  user?.chatId.toString() == chatId?.toString()
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {user.name.charAt(0)}
                </span>
              </div>
              {activeUsers.includes(user._id) && (
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 
                              rounded-full ring-2 ring-white"
                />
              )}
              {true && (
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 
                              rounded-full flex items-center justify-center"
                >
                  <span className="text-xs text-white font-medium">
                    {user.unreadCount || 2}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-medium text-gray-900 truncate">
                {user.name}
              </h2>
              <p className="text-sm text-gray-500 truncate">
                {user?.message || "I am having a problem"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftSideBox;
