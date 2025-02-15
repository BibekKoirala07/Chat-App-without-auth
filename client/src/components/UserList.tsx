import { ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSocket } from "../store/SocketContext";
import AddGroupModal from "./AddGroupModal";

const backendUrl =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PROD_BACKEND_URI
    : import.meta.env.VITE_DEV_BACKEND_URI;

const UserList = ({
  users,
  groups,
  setGroups,
}: {
  users: any;
  groups: any;
  setGroups: any;
}) => {
  const location = useLocation();
  // console.log("location", location);
  const { userId, groupId } = useParams();
  const { user } = useSocket();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // To control modal visibility

  const handleCreateGroup = async (groupName: string, members: string[]) => {
    console.log("Creating group:", groupName, members);
    const url = `${backendUrl}/api/chats/create/${user?._id}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Make sure the server understands it's a JSON payload
        },
        body: JSON.stringify({ groupName, members }),
      });
      const data = await response.json();
      console.log("data", data);
      if (response.ok) {
        setGroups((prevState: any[]) => [...prevState, data.data]);
      }
    } catch (error: any) {
      console.log("error", error.message);
    }
    setIsModalOpen(false);
  };

  // console.log("users", users);

  const [friendsOrGroup, setFriendsOrGroup] = useState(
    location.pathname.includes("group") ? "Groups" : "Friends"
  );
  const { activeUsers } = useSocket();

  const filteredUsers = users.filter((user: any) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter((group: any) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="p-6 bg-white rounded-lg min-h-screen shadow-lg">
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
          onClick={() => setFriendsOrGroup("Friends")}
          className={`flex-1 p-3 cursor-pointer rounded-lg font-medium transition-colors
                     ${
                       friendsOrGroup == "Friends"
                         ? "bg-blue-600 text-white"
                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                     }`}
        >
          Friends
        </button>
        <button
          onClick={() => setFriendsOrGroup("Groups")}
          className={`flex-1 p-3 cursor-pointer rounded-lg font-medium transition-colors
                     ${
                       friendsOrGroup == "Groups"
                         ? "bg-blue-600 text-white"
                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                     }`}
        >
          Groups
        </button>
      </div>
      {friendsOrGroup == "Friends" && (
        <div className="mt-6 space-y-4">
          {filteredUsers.map((user: any) => (
            <Link
              to={"/chat/" + user._id}
              key={user._id}
              // onClick={() => handleChatChange(user._id)}
              className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors
                ${
                  userId?.toString() == user._id.toString()
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">
                    {user?.name?.charAt(0).toUpperCase().toString() || "R"}
                  </span>
                </div>
                {activeUsers.includes(user._id) && (
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 
                              rounded-full ring-2 ring-white"
                  />
                )}
                {false && (
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 
                              rounded-full flex items-center justify-center"
                  >
                    <span className="text-xs text-white font-medium">{1}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-gray-900 truncate">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500 truncate">
                  {"I am having a problem"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {friendsOrGroup === "Groups" && (
        <div className="mt-4 text-right">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 cursor-pointer py-2 bg-blue-600 text-white rounded-lg"
          >
            Add Group
          </button>
        </div>
      )}

      {friendsOrGroup == "Groups" && (
        <div className="mt-6 space-y-4">
          {filteredGroups.map((group: any) => (
            <Link
              to={"/group/" + group._id}
              key={group._id}
              // onClick={() => handleChatChange(user._id)}
              className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors
                ${
                  groupId?.toString() == group._id.toString()
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">
                    {group.name.charAt(0).toUpperCase().toString()}
                  </span>
                </div>
                {activeUsers.includes(group._id) && (
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 
                              rounded-full ring-2 ring-white"
                  />
                )}
                {false && (
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 
                              rounded-full flex items-center justify-center"
                  >
                    <span className="text-xs text-white font-medium">{1}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-gray-900 truncate">
                  {group.name}
                </h2>
                <p className="text-sm text-gray-500 truncate">
                  {"I am having a problem"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      <AddGroupModal
        users={users}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleCreateGroup={handleCreateGroup}
      />
    </div>
  );
};

export default UserList;
