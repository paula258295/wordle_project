const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

let chatHistory = [];
let activeUsers = {};
let uniqueUsers = new Set();

io.on("connection", (socket) => {
  console.log("Użytkownik połączony:", socket.id);

  const username = socket.handshake.query.username;
  if (username) {
    activeUsers[socket.id] = username;
    uniqueUsers.add(username);
    console.log(`Dodano użytkownika: ${username}`);

    io.emit("updateUsers", Array.from(uniqueUsers));
  }

  socket.emit("chatHistory", chatHistory);

  socket.on("sendMessage", (data) => {
    const message = { username, text: data.text };
    chatHistory.push(message);

    io.emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log(`Użytkownik rozłączony: ${socket.id}`);
    
    if (activeUsers[socket.id]) {
      delete activeUsers[socket.id];
      uniqueUsers = new Set(Object.values(activeUsers));
      io.emit("updateUsers", Array.from(uniqueUsers));
    }
  });
});

server.listen(3002, () => {
  console.log("Serwer WebSocket działa na porcie 3002");
});
