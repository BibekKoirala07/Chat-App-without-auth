import { useState } from "react";

const NamePrompt = ({ onSubmit }: { onSubmit: any }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }
    onSubmit(name.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg w-96 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">Welcome to Chat</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-300 mb-2">
              Enter your name to continue
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="Your name"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
};

export default NamePrompt;
