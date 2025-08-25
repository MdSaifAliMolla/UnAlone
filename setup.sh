#!/bin/bash

# Root project
mkdir -p client/public client/src/{api,assets/avatars,components/{common,map,chat,layout,meetup},context,hooks,pages,services,styles}

# Client files
touch client/public/index.html
touch client/src/api/{authService.js,meetupService.js,userService.js}
touch client/src/context/{AuthContext.js,SocketContext.js}
touch client/src/pages/{HomePage.jsx,GlobalCafePage.jsx,ProfilePage.jsx,LoginPage.jsx}
touch client/src/services/socket.js
touch client/src/{App.js,index.js}
touch client/.env
touch client/package.json

# Services root
mkdir -p services

# 1. API Gateway
mkdir -p services/1-api-gateway
touch services/1-api-gateway/{Dockerfile,package.json}

# 2. Auth Service
mkdir -p services/2-auth-service/src/{controllers,models,routes,services,utils}
touch services/2-auth-service/src/index.js
touch services/2-auth-service/{Dockerfile,package.json}

# 3. Meetup Service
mkdir -p services/3-meetup-service/src/{controllers,event-producers,models,routes,services}
touch services/3-meetup-service/src/index.js
touch services/3-meetup-service/{Dockerfile,package.json}

# 4. Geospatial Service
mkdir -p services/4-geospatial-service/src/{event-consumers,services,routes}
touch services/4-geospatial-service/src/index.js
touch services/4-geospatial-service/{Dockerfile,package.json}

# 5. Chat Service
mkdir -p services/5-chat-service/src/{api,models,socket,event-producers}
touch services/5-chat-service/src/{index.js,socket/{rooms.js,index.js}}
touch services/5-chat-service/{Dockerfile,package.json}

echo "✅ Project structure generated successfully!"
