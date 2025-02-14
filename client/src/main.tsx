import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SocketProvider } from "./store/SocketContext.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <SocketProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SocketProvider>
);
