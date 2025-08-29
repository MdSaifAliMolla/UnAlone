# Unalone - Never Be Alone Again

A full-stack social networking application that helps people connect with others nearby through real-time map-based meetups and chat functionality.

## 🏗️ Architecture

This is a microservices-based application with:
- **React Frontend** - Modern, responsive UI with DaisyUI styling and real-time features
- **API Gateway** - Central routing and load balancing
- **Auth Service** - User authentication and profile management
- **Meetup Service** - Meetup CRUD operations
- **Geospatial Service** - Location-based search with in-memory storage
- **Chat Service** - Real-time WebSocket chat with MongoDB persistence

## 🚀 Features

- **🗺️ Interactive Map**: Click anywhere to create meetups with pulsing location markers
- **📍 Geospatial Search**: Find meetups within a specified radius
- **💬 Real-time Chat**: Meetup-specific chat rooms with Socket.io
- **📱 Global Cafe**: Facebook-style posts with likes and comments
- **🎭 Random Profiles**: Auto-generated usernames and avatars
- **🌓 Theme Toggle**: Beautiful paper and dark themes
- **⚡ Responsive Design**: Works perfectly on desktop and mobile
- **🔐 JWT Authentication**: Secure user sessions

## 🎨 Design Features

- **Paper-like texture** with subtle noise patterns
- **Modern typography** using Inter, Merriweather, and JetBrains Mono
- **Smooth animations** and hover effects
- **Accessible color schemes** in both light and dark modes
- **Custom map styling** that matches the website theme
- **Pulsing meetup markers** for visual appeal

## 📦 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unalone
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:4000
   - Health Check: http://localhost:4000/api/health/all

### Local Development

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up postgres mongodb
   ```

3. **Start all services**
   ```bash
   npm run dev
   ```

## 🛠️ Technology Stack

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Tailwind CSS + DaisyUI** for beautiful, responsive styling
- **React Leaflet** for interactive maps
- **Socket.io Client** for real-time features
- **React Hook Form** for form management
- **React Hot Toast** for notifications
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js + Express** for all services
- **PostgreSQL** for user and meetup data
- **MongoDB** for chat messages and posts
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Sequelize** ORM for PostgreSQL
- **Mongoose** ODM for MongoDB

### Infrastructure
- **Docker** for containerization
- **Nginx** for frontend serving
- **Microservices architecture** for scalability

## 📁 Project Structure

```
unalone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth, Theme, Socket)
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main app component
│   ├── public/
│   └── package.json
├── services/
│   ├── 1-api-gateway/      # Central API gateway
│   ├── 2-auth-service/     # Authentication service
│   ├── 3-meetup-service/   # Meetup management
│   ├── 4-geospatial-service/ # Location-based features
│   └── 5-chat-service/     # Real-time chat and posts
├── docker-compose.yml      # Multi-container setup
└── package.json           # Root package file
```

## 🌟 Key Features Breakdown

### Map-Based Meetups
- Click anywhere on the map to create a meetup
- Pulsing circular markers show active meetups
- User location detection and display
- Distance calculation for nearby meetups

### Global Cafe
- Facebook-style post system
- Like and comment functionality
- Real-time updates via Socket.io
- Infinite scroll loading

### Chat System
- Meetup-specific chat rooms
- Real-time messaging
- User join/leave notifications
- Message history persistence

### Profile Management
- Customizable avatars from DiceBear API
- Random username generation
- Theme switching (Paper/Dark)
- Activity statistics

### Theme System
- **Paper Theme**: Light, clean design with subtle textures
- **Dark Theme**: Modern dark interface
- Consistent styling across all components
- Custom map tiles that match the theme

## 🔧 Configuration

### Environment Variables

**Auth Service**
```bash
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/unalone
JWT_SECRET=your-super-secret-jwt-key
```

**Meetup Service**
```bash
PORT=3002
DATABASE_URL=postgresql://postgres:password@localhost:5432/unalone
GEOSPATIAL_SERVICE_URL=http://localhost:5003
```

**Chat Service**
```bash
PORT=3004
MONGODB_URL=mongodb://admin:password@localhost:27017/unalone?authSource=admin
```

## 🚀 Deployment

The application is designed to be easily deployable with Docker:

1. **Production build**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

2. **Environment setup**
   - Configure production database URLs
   - Set secure JWT secrets
   - Update CORS origins for production domains

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DiceBear** for avatar generation API
- **OpenStreetMap** for map tiles
- **DaisyUI** for beautiful UI components
- **Leaflet** for interactive maps

---

**Made with ❤️ for bringing people together**