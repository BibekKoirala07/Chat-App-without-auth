import React, { useState } from "react";
import { X } from "lucide-react";

interface AddGroupModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  users: { _id: string; name: string }[];
  handleCreateGroup: (groupName: string, members: string[]) => void;
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  users,
  handleCreateGroup,
}) => {
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const onCreateGroup = () => {
    if (newGroupName.trim() && selectedUsers.length) {
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

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={handleCloseModal}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* Modal header */}
        <h2 className="text-xl font-bold mb-6">Create a New Group</h2>

        {/* Group name input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Enter group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Members selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Select Members</h3>
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
            {users.map((user) => (
              <label
                key={user._id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => {
                    setSelectedUsers((prevState) => {
                      if (prevState.includes(user._id)) {
                        return prevState.filter((id) => id !== user._id);
                      } else {
                        return [...prevState, user._id];
                      }
                    });
                  }}
                  className="mr-3"
                />
                <span>{user.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onCreateGroup}
            disabled={!newGroupName.trim() || selectedUsers.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupModal;
