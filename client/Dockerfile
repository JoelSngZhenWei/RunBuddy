# syntax=docker/dockerfile:1.7
FROM node:22-alpine

# Avoid permission issues with root inside container
WORKDIR /app

# Install dependencies first (cache layer)
COPY package.json package-lock.json ./
RUN npm install

# Copy full app code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Dev mode (hot reload)
CMD ["npm", "run", "dev"]
