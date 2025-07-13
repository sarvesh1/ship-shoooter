
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