# Unalone - Never Be Alone Again

A full-stack social networking application that helps people connect with others nearby through real-time map-based meetups and chat functionality.

## 🏗️ Architecture

This is a microservices-based application with:
- **React Frontend** - Modern, responsive UI with real-time features
- **API Gateway** - Central routing and load balancing
- **Auth Service** - User authentication and profile management
- **Meetup Service** - Meetup CRUD operations with Kafka event streaming
- **Geospatial Service** - Redis-powered location-based search
- **Chat Service** - Real-time WebSocket chat with MongoDB persistence

## 🚀 Features

- **🗺️ Interactive Map**: Click anywhere to create meetups
- **📍 Geospatial Search**: Find meetups within a specified radius
- **💬 Real-time Chat**: Global cafe + meetup-specific chat rooms
- **🎭 Random Profiles**: Auto-generated usernames and avatars
- **⚡ Event-driven**: Kafka-powered microservices communication
- **🔐 JWT Authentication**: Secure user sessions
- **📱 Responsive Design**: Works on desktop and mobile

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd unalone

# Install root dependencies
npm install

# Install all service dependencies
npm run install:all
```

### 2. Environment Setup

Create `.env` files in each service directory:

**services/2-auth-service/.env**
```
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/unalone
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**services/3-meetup-service/.env**
```
PORT=3002
DATABASE_URL=postgresql://postgres:password@localhost:5432/unalone
KAFKA_BROKER_URL=localhost:9092
```

**services/4-geospatial-service/.env**
```
PORT=3003
REDIS_URL=redis://localhost:6379
KAFKA_BROKER_URL=localhost:9092
```

**services/5-chat-service/.env**
```
PORT=3004
MONGODB_URL=mongodb://admin:password@localhost:27017/unalone?authSource=admin
CLIENT_URL=http://localhost:3000
```

**services/1-api-gateway/.env**
```
PORT=4000
AUTH_SERVICE_URL=http://localhost:3001
MEETUP_SERVICE_URL=http://localhost:3002
GEOSPATIAL_SERVICE_URL=http://localhost:3003
CHAT_SERVICE_URL=http://localhost:3004
```

**client/.env**
```
REACT_APP_API_URL=http://localhost:4000
```

### 3. Start Infrastructure Services

```bash
# Start databases and message broker
docker-compose up -d postgres redis mongodb zookeeper kafka

# Wait for services to be ready (about 30 seconds)
sleep 30
```

### 4. Start Application Services

```bash
# Option 1: Start all services concurrently (recommended for development)
npm run dev

# Option 2: Start services individually in separate terminals
npm run dev:gateway    # Terminal 1
npm run dev:auth       # Terminal 2  
npm run dev:meetup     # Terminal 3
npm run dev:geo        # Terminal 4
npm run dev:chat       # Terminal 5
npm run dev:client     # Terminal 6
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **Health Checks**: 
  - Auth: http://localhost:3001/health
  - Meetup: http://localhost:3002/health
  - Geospatial: http://localhost:3003/health
  - Chat: http://localhost:3004/health

## 📱 How to Use

1. **Register**: Create an account and get a random username/avatar
2. **Login**: Access the main map interface
3. **Create Meetup**: Click anywhere on the map to create a meetup
4. **Join Chat**: Click on meetup markers to join their chat rooms
5. **Global Cafe**: Use the "Cafe" tab for general conversations
6. **Profile**: View your randomly generated profile

## 🗄️ Database Schemas

### PostgreSQL (Users & Meetups)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    "avatarUrl" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Meetups table  
CREATE TABLE meetups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    "ownerId" UUID NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### MongoDB (Chat Messages)

```javascript
{
  _id: ObjectId,
  roomId: String,        // 'global-cafe' or meetup UUID
  roomType: String,      // 'global' or 'meetup'
  userId: String,        // User UUID
  username: String,
  avatarUrl: String,
  message: String,
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Redis (Geospatial Index)

```
Key: 'meetups_geo'
Type: GEO (sorted set)
Members: meetup UUIDs with lat/lng coordinates

Key: 'meetup:{uuid}'  
Type: HASH
Fields: id, title, description, lat, lng, ownerId, expiresAt, createdAt
```

## 🔧 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - User login  
- `GET /profile` - Get user profile (requires auth)

### Meetups (`/api/meetups`)
- `POST /` - Create new meetup (requires auth)
- `GET /:id` - Get meetup details
- `DELETE /:id` - Delete meetup (owner only)
- `GET /user/my-meetups` - Get user's meetups (requires auth)

### Geospatial (`/api/geo`)
- `GET /nearby?lat={lat}&lng={lng}&radius={km}` - Find nearby meetups
- `GET /meetup/:id` - Get meetup from cache

### Chat (`/api/chat`)
- `GET /global/history` - Get global chat history
- `GET /meetup/:id/history` - Get meetup chat history

### WebSocket Events

**Global Chat:**
- `joinGlobalCafe(userProfile)`
- `sendGlobalMessage({message, user})`
- `newMessage` - Receive new message
- `userJoined` - User joined notification

**Meetup Chat:**
- `joinMeetupRoom({meetupId, user})`
- `sendMeetupMessage({meetupId, message, user})`
- `leaveMeetupRoom({meetupId, user})`
- `newMeetupMessage` - Receive new meetup message
- `userJoinedMeetup` - User joined meetup notification

## 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Reset all data
docker-compose down -v
```

## 🧪 Testing

```bash
# Test user registration
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test creating a meetup (replace TOKEN)
curl -X POST http://localhost:4000/api/meetups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Coffee Chat","description":"Let'\''s grab coffee!","lat":22.5726,"lng":88.3639,"expiresAt":"2024-12-31T10:00:00Z"}'

# Test finding nearby meetups
curl "http://localhost:4000/api/geo/nearby?lat=22.5726&lng=88.3639&radius=10"
```

## 🚀 Production Deployment

### Environment Variables
Set these in production:
- `JWT_SECRET` - Use a strong, random secret
- Database URLs with production credentials
- `CLIENT_URL` - Your frontend domain
- `KAFKA_BROKER_URL` - Production Kafka cluster
- `REDIS_URL` - Production Redis instance

### Infrastructure Requirements
- **Load Balancer** - For API Gateway
- **Database Cluster** - PostgreSQL with replication
- **Redis Cluster** - For high availability
- **Kafka Cluster** - Minimum 3 brokers
- **MongoDB Replica Set** - For chat persistence
- **Container Orchestration** - Kubernetes or Docker Swarm

### Scaling Considerations
- API Gateway: Multiple instances behind load balancer
- Auth Service: Stateless, can be scaled horizontally
- Meetup Service: Scale based on creation rate
- Geospatial Service: Scale based on search queries
- Chat Service: Use Socket.IO Redis adapter for multiple instances

## 📝 Development Notes

### Adding New Features
1. Create database migrations if needed
2. Add API endpoints to appropriate service
3. Update Kafka event schemas if needed
4. Add frontend components
5. Update this README

### Code Organization
- Each service is completely independent
- Shared dependencies should be minimal
- Use environment variables for all configuration
- Follow RESTful API design principles
- Implement proper error handling and logging

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints  
- End-to-end tests for user workflows
- Load testing for scalability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**"Kafka connection failed"**
- Ensure Kafka and Zookeeper are running
- Check if port 9092 is accessible
- Wait longer for Kafka to fully start

**"Database connection error"**
- Verify PostgreSQL/MongoDB are running
- Check connection strings in .env files
- Ensure databases are created

**"WebSocket connection failed"**
- Check if chat service is running on port 3004
- Verify CORS settings in production
- Check browser console for errors

**"Map not loading"**
- Check if you have internet connection (tiles come from OpenStreetMap)
- Verify geolocation permissions in browser
- Check browser console for JavaScript errors

### Performance Issues
- Monitor Redis memory usage
- Check Kafka consumer lag
- Optimize database queries with indexes
- Scale services horizontally if needed

### Debugging Tips
- Use `docker-compose logs -f [service]` to view service logs
- Check network connectivity between services
- Verify environment variables are loaded correctly
- Use Redis CLI to inspect geospatial data
- Use MongoDB Compass to inspect chat messages