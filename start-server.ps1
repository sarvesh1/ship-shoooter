# Optional: echo what’s happening
Write-Host "Starting the game server using Docker Compose..."

# Set environment variables
$env:DOCKERFILE = "Dockerfile.prod"
$env:MOUNT_CODE = ""

# Run docker-compose
docker-compose up --build