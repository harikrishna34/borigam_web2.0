# Use official Node.js 22 image
FROM node:22.1.0

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the entire backend source code
COPY . .

# Expose your backend port (example: 5000 or 8080)
EXPOSE 5000

# Start the backend
CMD ["npm", "start"]
