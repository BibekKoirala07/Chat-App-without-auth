import { useParams } from "react-router-dom";

const Message = ({
  content,
  timeStamp,
  isUser,
  avatar,
  name,
}: {
  content: any;
  timeStamp?: string;
  isUser: any;
  avatar?: any;
  name: any;
}) => (
  <div className={`flex gap-3 mb-6 ${isUser ? "flex-row-reverse" : ""}`}>
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
        {avatar || name?.charAt(0)}
      </div>
    </div>
    <div
      className={`flex flex-col ${
        isUser ? "items-end" : "items-start"
      } max-w-[70%]`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm text-gray-400">{name}</span>
        <span className="text-xs text-gray-500">{timeStamp || "real"}</span>
      </div>
      <div
        className={`rounded-2xl p-3 ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-none"
            : "bg-gray-800 text-white rounded-tl-none"
        }`}
      >
        {content}
      </div>
    </div>
  </div>
);

const RightSideBox = () => {
  const { chatId } = useParams();
  console.log("chatId", chatId);
  const messages = [
    {
      id: 1,
      content:
        "Hello, I'm having some trouble with a piece of software I recently downloaded from your site. It keeps crashing every time I try to open it.",
      timestamp: "14:31",
      name: "Taylor Smith",
      isUser: true,
    },
    {
      id: 2,
      content: "Every time I attempt to launch the software, it crashes",
      timestamp: "14:35",
      name: "Taylor Smith",
      isUser: true,
    },
    {
      id: 3,
      content:
        "Thank you for letting me know, Taylor. Can you tell me which version of the software you're using and what operating system you're on? This will help me better understand the issue.",
      timestamp: "14:39",
      name: "Kate Moore (Support)",
      isUser: false,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
            T
          </div>
          <div>
            <h2 className="font-medium text-white">Taylor Smith</h2>
            <span className="text-sm text-gray-400">Active now</span>
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

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <Message key={message.id} {...message} />
        ))}
      </div>

      {/* Input Area */}
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
          <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
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

export default RightSideBox;
