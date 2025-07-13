import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4000", "http://127.0.0.1:4000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Use default path: "/socket.io"
});

// Serve the client game from the root



// Option 2: Serve a static HTML file if you have one
// app.use(express.static(path.join(__dirname, '../public')));

// Basic Socket.IO setup

// In-memory player state
const players = {};

io.on("connection", (socket) => {
  console.log("[CONNECTION] New socket connected:", socket.id);
  console.log("[CONNECTION] Handshake headers:", socket.handshake.headers);
  console.log("[CONNECTION] Handshake address:", socket.handshake.address);

  // Handle player join
  socket.on("player-join", (data) => {
    // Check for name conflict
    const nameTaken = Object.values(players).some((p) => p.name === data.name);
    if (nameTaken) {
      socket.emit("name-taken");
      return;
    }
    players[socket.id] = {
      id: socket.id,
      name: data.name,
      x: data.x,
      y: data.y,
      rotation: typeof data.rotation === "number" ? data.rotation : 0,
      coins: 0,
    };
    console.log(`[JOIN] Player joined: ${data.name} (${socket.id}) at (${data.x}, ${data.y}), rotation: ${data.rotation}`);
    io.emit("players-update", Object.values(players));
  });

  // Handle player movement
  socket.on("player-move", (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      if (typeof data.rotation === "number") {
        players[socket.id].rotation = data.rotation;
      }
      io.emit("players-update", Object.values(players));
    }
  });

  // Listen for scoring event (coin collected)
  socket.on("player-score", () => {
    if (players[socket.id]) {
      players[socket.id].coins = (players[socket.id].coins || 0) + 1;
      console.log(`[SCORE] Player ${players[socket.id].name} (${socket.id}) scored. Total coins: ${players[socket.id].coins}`);
      io.emit("players-update", Object.values(players));
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (players[socket.id]) {
      console.log(`[LEAVE] Player left: ${players[socket.id].name} (${socket.id})`);
    } else {
      console.log("User disconnected:", socket.id);
    }
    delete players[socket.id];
    io.emit("players-update", Object.values(players));
  });
});

const PORT = process.env.PORT || 4001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Ship Shooter server running on port ${PORT}`);
});
