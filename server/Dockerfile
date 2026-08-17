FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY server ./server

EXPOSE 5000

CMD ["node", "server/app.js"]
