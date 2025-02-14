require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const socketHandler = require("./sockets/socket");
const userRoutes = require("./routes/userRoutes");
const { default: mongoose } = require("mongoose");
const messageRoutes = require("./routes/messageRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

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

console.log(process.env.PROD_FRONTEND_URI);

const io = new socketIO.Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.PROD_FRONTEND_URI
        : process.env.DEV_FRONTEND_URI,
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
});

app.get("/", (req, res) => {
  res.send("Welcome to the Socket.IO Server!");
});

socketHandler(io);

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoutes);
mongoose.connect(process.env.MONGO_URI).then(() => {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

app.use((req, res, next) => {
  console.error(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    url: req.originalUrl,
  });
});
