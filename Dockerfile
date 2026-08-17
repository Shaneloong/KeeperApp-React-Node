FROM node:22

WORKDIR /app

# Copy root package details
COPY package*.json ./
RUN npm install

# Copy frontend package details and build it
COPY keeper-app/package*.json keeper-app/
RUN cd keeper-app && npm install

COPY keeper-app/ keeper-app/
RUN cd keeper-app && npm run build

# Copy backend files
COPY server/ server/

EXPOSE 3000

CMD ["npm", "start"]
