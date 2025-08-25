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
