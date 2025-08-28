#!/bin/bash

echo "🚀 Starting Unalone Development Environment..."

# Kill any existing processes on these ports
echo "🔧 Cleaning up existing processes..."
for port in 3001 3002 3003 3004 4000 5433 6380 27018; do
    lsof -ti:$port | xargs -r kill -9 2>/dev/null || true
done

# Start infrastructure with Docker Compose
echo "🐳 Starting infrastructure (PostgreSQL:5433, Redis:6380, MongoDB:27018)..."
docker-compose up -d postgres redis mongodb

# Wait for services to be ready
echo "⏳ Waiting for infrastructure to be ready..."
sleep 15

# Test database connections
echo "🔍 Testing database connections..."
timeout 10 bash -c 'until nc -z localhost 5433; do sleep 1; done' && echo "✅ PostgreSQL ready"
timeout 10 bash -c 'until nc -z localhost 6380; do sleep 1; done' && echo "✅ Redis ready"
timeout 10 bash -c 'until nc -z localhost 27018; do sleep 1; done' && echo "✅ MongoDB ready"

# Start services in background
echo "🔧 Starting microservices..."

# Auth Service
cd services/2-auth-service
export DATABASE_URL="postgresql://postgres:password@localhost:5433/unalone"
export JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
npm run dev &
AUTH_PID=$!
cd ../..

# Meetup Service  
cd services/3-meetup-service
export DATABASE_URL="postgresql://postgres:password@localhost:5433/unalone"
export JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
export GEOSPATIAL_SERVICE_URL="http://localhost:3003"
npm run dev &
MEETUP_PID=$!
cd ../..

# Geospatial Service
cd services/4-geospatial-service
export REDIS_URL="redis://localhost:6380"
npm run dev &
GEO_PID=$!
cd ../..

# Chat Service
cd services/5-chat-service
export MONGODB_URL="mongodb://admin:password@localhost:27018/unalone?authSource=admin"
export CLIENT_URL="http://localhost:3000"
npm run dev &
CHAT_PID=$!
cd ../..

# API Gateway
cd services/1-api-gateway
export AUTH_SERVICE_URL="http://localhost:3001"
export MEETUP_SERVICE_URL="http://localhost:3002"
export GEOSPATIAL_SERVICE_URL="http://localhost:3003"
export CHAT_SERVICE_URL="http://localhost:3004"
npm run dev &
GATEWAY_PID=$!
cd .

echo "✅ All services started!"
echo "📡 API Gateway: http://localhost:4000"
echo "🔐 Auth Service: http://localhost:3001"
echo "📅 Meetup Service: http://localhost:3002"
echo "🌍 Geospatial Service: http://localhost:3003"
echo "💬 Chat Service: http://localhost:3004"
echo ""
echo "📊 Database Access:"
echo "🐘 PostgreSQL: localhost:5433"
echo "🔴 Redis: localhost:6380"  
echo "🍃 MongoDB: localhost:27018"
echo ""
echo "🏥 Health Check: http://localhost:4000/api/health/all"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping all services..."
    kill $AUTH_PID $MEETUP_PID $GEO_PID $CHAT_PID $GATEWAY_PID 2>/dev/null
    docker-compose down
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for all background processes
wait