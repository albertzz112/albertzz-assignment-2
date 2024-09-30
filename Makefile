# Variables
PORT = 3000

# Default target
all: install run

# Install dependencies
install:
	@echo "No dependencies to install for a static site."

# Run the web application locally
run:
	@echo "Running the web application on http://localhost:$(PORT)..."
	@python3 -m http.server $(PORT)

# Help message
help:
	@echo "Makefile commands:"
	@echo "  make install      Install required dependencies (none for this project)."
	@echo "  make run          Run the web application on localhost:$(PORT)."
	@echo "  make help         Display this help message."
