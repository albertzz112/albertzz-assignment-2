# Makefile for KMeans Clustering Visualization Web Application

# Variables
SERVER = http-server
PORT = 3000

# Default target
all: install run

# Install dependencies
install:
	@echo "Installing dependencies..."
	@npm install http-server

# Run the web application
run:
	@echo "Running the web application..."
	@http-server . -p $(PORT)

# Clean up node_modules (optional)
clean:
	@echo "Cleaning up..."
	@rm -rf node_modules

# Help message
help:
	@echo "Makefile commands:"
	@echo "  make install      Install required dependencies."
	@echo "  make run          Run the web application on localhost:3000."
	@echo "  make clean        Clean up node_modules."
	@echo "  make help         Display this help message."
