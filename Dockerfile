# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY finance-diary-backend/package.json ./finance-diary-backend/

# Install dependencies
RUN npm install
RUN cd finance-diary-backend && npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
