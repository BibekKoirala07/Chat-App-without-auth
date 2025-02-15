import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100 border border-gray-300 rounded-2xl shadow-md w-full max-w-sm mx-auto animate-pulse">
      <Loader2 className="text-gray-600 w-12 h-12 animate-spin" />
      <h2 className="text-xl font-semibold text-gray-700 mt-3">Loading...</h2>
      <p className="text-gray-500 text-sm mt-2">
        Please wait while we process your request.
      </p>
    </div>
  );
};

export default Loading;
