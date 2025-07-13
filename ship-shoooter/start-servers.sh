#!/bin/bash

# Start backend server
(cd server && pnpm start) &

# Start frontend (Next.js) app
pnpm dev --port 4000