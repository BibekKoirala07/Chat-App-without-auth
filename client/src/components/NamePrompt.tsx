import { useState } from "react";
import { useSocket } from "../store/SocketContext";

const NamePrompt = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { connectSocket } = useSocket();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters long");
      return;
    }
    setLoading(true);
    connectSocket(name);
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
            <p className="text-red-400 text-sm my-2 p-2 rounded-xl text-center">
              you need to have unique name
            </p>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full hover:opacity-0.8 cursor-pointer bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {loading ? "Requesting..." : "Join Chat"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NamePrompt;
