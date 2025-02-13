require("dotenv").config({ path: "../.env" });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const SocketServer = require("./socket/socketServer");
const chatRoutes = require("./routes/chatRoutes");
const socketServer = require("./socket/socketServer");

console.log("process", process.env.DEV_FRONTEND_URI);

const app = express();
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.PROD_FRONTEND_URI
        : process.env.DEV_FRONTEND_URI,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV == "production"
        ? process.env.PROD_FRONTEND_URI
        : process.env.DEV_FRONTEND_URI,
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
});

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

socketServer(io);

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
