#!/bin/bash

echo "🧹 Cleaning up Docker and port conflicts..."

# Stop all containers
echo "🛑 Stopping all containers..."
docker-compose down --remove-orphans

# Remove any containers that might be using these ports
echo "🗑️ Removing any conflicting containers..."
docker ps -a --filter "expose=5432" --filter "expose=6379" --filter "expose=27017" --filter "expose=3001" --filter "expose=3002" --filter "expose=3003" --filter "expose=3004" --filter "expose=4000" -q | xargs -r docker rm -f

# Kill processes on our ports (Windows-compatible)
echo "🔧 Killing processes on ports..."
for port in 3001 3002 3003 3004 4000 5432 5433 6379 6380 27017 27018; do
    echo "Checking port $port..."
    # Windows version
    for /f "tokens=5" %a in ('netstat -aon ^| find ":$port"') do taskkill /f /pid %a 2>nul
    # Linux/Mac version (will fail silently on Windows)
    lsof -ti:$port | xargs -r kill -9 2>/dev/null || true
done

# Clean up Docker system
echo "🧹 Cleaning Docker system..."
docker system prune -f

# Remove orphaned volumes
echo "🗑️ Removing orphaned volumes..."
docker volume prune -f

echo "✅ Cleanup complete!"
echo ""
echo "Now you can run:"
echo "docker-compose up --build"