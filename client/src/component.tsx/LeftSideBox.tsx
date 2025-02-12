import { useState } from "react";
import { Search, ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const LeftSideBox = () => {
  const [activeTab, setActiveTab] = useState("inbox");
  const navigate = useNavigate();
  const { chatId } = useParams();

  const handleChatSelect = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const chats = [
    {
      id: 1,
      name: "Tony Reichert",
      message: "Hi, I'm having trouble logging into my account...",
      unreadCount: 3,
      online: true,
    },
    {
      id: 2,
      name: "Sarah Parker",
      message: "Thank you for your quick response...",
      unreadCount: 1,
      online: false,
    },
    {
      id: 3,
      name: "James Wilson",
      message: "Could you help me with the setup?",
      unreadCount: 0,
      online: true,
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg h-full">
      {/* Header */}
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
        />
      </div>

      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex-1 p-3 rounded-lg font-medium transition-colors
                     ${
                       activeTab === "inbox"
                         ? "bg-blue-600 text-white"
                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                     }`}
        >
          Inbox
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`flex-1 p-3 rounded-lg font-medium transition-colors
                     ${
                       activeTab === "unread"
                         ? "bg-blue-600 text-white"
                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                     }`}
        >
          Unread
        </button>
      </div>

      {/* Chat List */}
      <div className="mt-6 space-y-4">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleChatSelect(chat.id.toString())}
            className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors
                ${
                  chatId === chat.id.toString()
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {chat.name.charAt(0)}
                </span>
              </div>
              {chat.online && (
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 
                              rounded-full ring-2 ring-white"
                />
              )}
              {chat.unreadCount > 0 && (
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 
                              rounded-full flex items-center justify-center"
                >
                  <span className="text-xs text-white font-medium">
                    {chat.unreadCount}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-medium text-gray-900 truncate">
                {chat.name}
              </h2>
              <p className="text-sm text-gray-500 truncate">{chat.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftSideBox;
