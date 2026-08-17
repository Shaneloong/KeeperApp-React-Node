# Stage 1: Build the React frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY keeper-app/package*.json ./keeper-app/
RUN cd keeper-app && npm install --legacy-peer-deps
COPY keeper-app ./keeper-app
# Use openssl-legacy-provider as the build step needed it
RUN cd keeper-app && export NODE_OPTIONS=--openssl-legacy-provider && npm run build

# Stage 2: Serve the app with Express backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server ./server
# Copy the built React app from the build stage
COPY --from=build /app/keeper-app/build ./keeper-app/build

EXPOSE 3000
CMD ["npm", "start"]
