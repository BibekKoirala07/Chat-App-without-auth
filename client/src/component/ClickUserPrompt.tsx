const ClickUserPrompt = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Ready to start chatting?</h2>
      <p className="text-gray-400 mb-6">
        Click on a user to start a conversation
      </p>
      <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200">
        Select User
      </button>
    </div>
  );
};

export default ClickUserPrompt;
