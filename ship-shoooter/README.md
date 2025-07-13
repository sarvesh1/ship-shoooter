
# Ship Shooter Game

## Overview

Ship Shooter is a real-time multiplayer web game where players control spaceships, collect coins, and compete for high scores. The project is structured with two separate servers:

- **Game Server:** Handles real-time gameplay, player movement, and in-game events using WebSockets (Socket.IO).
- **Backend Server:** Tracks player scores and manages persistent data (future expansion).

This project is designed to run in a Docker container for local or cloud deployment. It is not intended for Vercel or serverless platforms.

## Architecture

- **Frontend:** Built with Next.js and React, located in the project root. Connects to the game server via WebSockets.
- **Game Server:** Node.js/Express/Socket.IO server (`/server` directory) for real-time multiplayer logic.
- **Backend Server:** (Planned/Optional) For persistent storage of scores and user data.

## Running Locally (with Docker)

1. **Build the Docker image:**
   ```bash
   docker build -t ship-shooter .
   ```
2. **Run the container:**
   ```bash
   docker run -p 4000:4000 -p 4001:4001 ship-shooter
   ```
   - Port 4000: Frontend (Next.js)
   - Port 4001: Game server (Socket.IO backend)

3. **Access the game:**
   - Open [http://localhost:4000](http://localhost:4000) in your browser.

## Development


You can also run the servers locally without Docker:

**On Linux/macOS:**
```bash
# In one terminal (for backend)
cd server && pnpm start

# In another terminal (for frontend)
pnpm dev --port 4000
```

**On Windows:**

You can use the provided PowerShell script to start both servers at once:

```powershell
./start-servers.ps1
```

Or, start them manually in two terminals as above.

## Features

- Real-time multiplayer gameplay
- Player movement and rotation
- Coin collection and score tracking
- Simple in-memory player state (can be extended to persistent storage)

## Project Structure

- `/` – Frontend (Next.js app)
- `/server` – Game server (Node.js/Socket.IO)
- `/public` – Static assets

## Dockerfile

The provided Dockerfile installs all dependencies and sets up the environment for both frontend and backend servers. Modify it as needed for your deployment.

---
Feel free to contribute or open issues for improvements!