import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Serve the client game from the root
app.use(express.static("../app"));

app.get("/", (req, res) => {
  res.sendFile("../app/game/page.tsx", { root: process.cwd() });
});

// Basic Socket.IO setup
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  // Placeholder for game logic
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Ship Shooter server running on port ${PORT}`);
});
