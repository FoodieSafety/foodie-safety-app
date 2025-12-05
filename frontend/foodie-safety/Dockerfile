# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

EXPOSE 3000

# Run React Dev Server
CMD ["npm", "start"]