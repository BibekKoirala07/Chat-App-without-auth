const EmptyChat = () => {
  return (
    <div className="md:flex hidden flex-col items-center justify-center h-full bg-gray-100 text-gray-700 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Start a Conversation</h2>
      <p className="text-center mb-4">
        Click on a user from the UserList to start a new conversation.
      </p>
      <div className="text-gray-500 text-sm italic">
        <p>Once you select a user, the chat will open here.</p>
      </div>
    </div>
  );
};

export default EmptyChat;
