const express = require("express");
const https = require("https");
const fs = require("fs");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const port = 3002;

const httpsOptions = {
  key: fs.readFileSync("..//..//localhost-key.pem"),
  cert: fs.readFileSync("..//..//localhost-cert.pem"),
};

const server = https.createServer(httpsOptions, app);

const io = new Server(server, {
  cors: {
    origin: "https://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "https://localhost:3000",
  credentials: true
}));

app.use(express.json());

let chatHistory = [];
let activeUsers = {};
let uniqueUsers = new Set();

let userWins = {}; 

const getLeader = () => {
  let leader = { username: '', wins: 0 };
  for (let userId in userWins) {
    if (userWins[userId] > leader.wins) {
      leader = { username: userId, wins: userWins[userId] };
    }
  }
  return leader;
};

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

  if (username) {
    activeUsers[socket.id] = username;
    console.log(`Zidentyfikowano użytkownika ${username}`);

    io.emit("leaderboard", getLeader());
  }

  socket.on("gameWin", (username) => {
    if (username) {
      if (!userWins[username]) {
        userWins[username] = 0;
      }
      userWins[username]++;
      
      io.emit("leaderboard", getLeader());
    }
  });


  socket.on("disconnect", () => {
    console.log(`Użytkownik rozłączony: ${socket.id}`);
    
    if (activeUsers[socket.id]) {
      delete activeUsers[socket.id];
      uniqueUsers = new Set(Object.values(activeUsers));
      io.emit("updateUsers", Array.from(uniqueUsers));
    }
  })
})

server.listen(port, () => {
  console.log(`Serwer WebSocket działa na HTTPS: https://localhost:${port}`);
})