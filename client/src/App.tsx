import { Route, Routes } from "react-router-dom";
import NamePrompt from "./components/NamePrompt";
import { useSocket } from "./store/SocketContext";
import AppLayout from "./layout/AppLayout";
import EmptyChat from "./components/EmptyChat";
import ChatContainer from "./components/ChatContainer";
import GroupContainer from "./components/GroupContainer";

const App = () => {
  const { user } = useSocket();
  return (
    <div className="max-h-screen max-w-screen">
      {/* <div className="absolute w-full bg-red-50 rounded-xl text-xl text-center text-red-500 m-2 p-2 py-3">
        I am currently building this. It might looks cluttered for now.
      </div> */}
      {!user && <NamePrompt />}
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<EmptyChat />} />
          <Route path="chat/:userId" element={<ChatContainer />} />
          <Route path="group/:groupId" element={<GroupContainer />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
