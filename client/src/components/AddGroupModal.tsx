import { useState } from "react";

interface AddGroupModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  users: { _id: string; name: string }[]; // List of users passed from parent
  handleCreateGroup: (groupName: string, members: string[]) => void; // Include members in the group creation
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  users,
  handleCreateGroup,
}) => {
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]); // List of selected users

  const onCreateGroup = () => {
    if (newGroupName.trim() && selectedUsers.length) {
      console.log("heres", newGroupName, selectedUsers);
      handleCreateGroup(newGroupName, selectedUsers);
      setNewGroupName("");
      setSelectedUsers([]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewGroupName("");
    setSelectedUsers([]);
  };

  return (
    isModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg w-96 shadow-xl relative">
          {/* Close Button (Cross) */}
          <button
            onClick={handleCloseModal}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          >
            <span className="text-xl">&times;</span>
          </button>

          <h2 className="text-xl font-semibold mb-4">Create a New Group</h2>

          <input
            type="text"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Members
            </label>
            <div className="max-h-40 overflow-y-auto mt-2 border border-gray-300 rounded-lg">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedUsers.includes(user._id) ? "bg-blue-100" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => {
                      setSelectedUsers((prevState) => {
                        // Create a new array to avoid mutating the previous state
                        const newState = [...prevState];

                        if (newState.includes(user._id)) {
                          // If the user is already selected, remove them from the array
                          return newState.filter((id) => id !== user._id);
                        } else {
                          // If the user is not selected, add them to the array
                          return [...newState, user._id];
                        }
                      });
                    }}
                  />

                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onCreateGroup}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Create Group
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default AddGroupModal;
