# Build stage
FROM node:18 AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-slim

ENV NODE_ENV=production
# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --ignore-scripts

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["node", "src/server.js"]
