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

io.on("connection", (socket) => {
  console.log("Użytkownik połączony:", socket.id);

  socket.emit("chatHistory", chatHistory);

  socket.on("sendMessage", (data) => {
    chatHistory.push(data);
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Użytkownik rozłączony:", socket.id);
  });
});

server.listen(3002, () => {
  console.log("Serwer WebSocket działa na porcie 3002");
});
