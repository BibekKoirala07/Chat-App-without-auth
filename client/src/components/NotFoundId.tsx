import { AlertTriangle } from "lucide-react";

const NoIdFound = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-100 border border-red-300 rounded-2xl shadow-md w-full max-w-sm mx-auto transform scale-100 transition-transform duration-300 hover:scale-105">
      <AlertTriangle className="text-red-600 w-12 h-12" />
      <h2 className="text-xl font-semibold text-red-700 mt-3">No ID Found</h2>
      <p className="text-red-500 text-sm mt-2">
        The requested ID does not exist. Please check and try again.
      </p>
    </div>
  );
};

export default NoIdFound;
