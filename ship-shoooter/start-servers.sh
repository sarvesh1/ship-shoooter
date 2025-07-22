#!/bin/bash

# Start backend server
(cd server && pnpm start -- --port 4001) &

# Start frontend (Next.js) app
pnpm dev --port 4000