# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the application files to the container
COPY . .

# Install a simple HTTP server for serving static files
RUN npm install -g http-server

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["http-server", "-p", "8080"]
