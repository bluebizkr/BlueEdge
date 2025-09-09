# Project Overview

This project is a comprehensive PLC (Programmable Logic Controller) monitoring system built around Node-RED, a flow-based programming tool for wiring together hardware devices, APIs, and online services. The system integrates a Svelte-based web application for real-time data visualization and an Express.js backend for API services and WebSocket communication. Docker is used for containerization, and Mosquitto acts as an MQTT broker for data transport.

**Key Components:**

*   **Node-RED:** (Implicitly) Used for collecting data from PLCs (likely via Modbus, given the manual names) and potentially publishing it to MQTT or directly to the Express backend's WebSocket server.
*   **Web Application (`web-app/`):**
    *   **Frontend (Svelte):** A single-page application that provides a real-time dashboard for monitoring PLC data. It fetches initial configuration from the backend and receives live updates via WebSockets.
    *   **Backend (Express.js):** Serves the Svelte frontend, provides an API endpoint for PLC address map configuration, and hosts a WebSocket server to push real-time data to the frontend.
*   **Mosquitto:** An MQTT broker (configured in `mosquitto/`) likely used by Node-RED to receive data from PLCs and then forward it to the web application.
*   **Docker:** Used for containerizing the web application and potentially other services like Node-RED and Mosquitto (indicated by `docker-compose.yml` and `Dockerfile`s).

**Architecture:**

PLC Data -> Node-RED -> MQTT (Mosquitto) -> Express Backend (WebSocket) -> Svelte Frontend

Alternatively, Node-RED might directly send data to the Express Backend's WebSocket endpoint.

# Building and Running

This project involves multiple components that can be built and run independently or together using Docker Compose.

## Web Application (`web-app/`)

The `web-app` directory contains both the Svelte frontend and the Express backend.

### Development

To run the web application in development mode (with live reloading for the frontend):

1.  Navigate to the `web-app` directory:
    ```bash
    cd web-app
    ```
2.  Install dependencies for both frontend and backend:
    ```bash
    npm install
    npm install --prefix frontend
    ```
3.  Start the development server (runs both frontend dev server and Express backend concurrently):
    ```bash
    npm run dev
    ```
    The Express backend will listen on `http://localhost:3000` and the WebSocket server on `ws://localhost:3001`. The Svelte frontend will be served by its own development server, typically on `http://localhost:8080` (as configured by `sirv-cli` and `rollup-plugin-livereload`).

### Production Build

To build the Svelte frontend for production:

1.  Navigate to the `web-app` directory:
    ```bash
    cd web-app
    ```
2.  Run the build script:
    ```bash
    npm run build
    ```
    This will generate optimized `bundle.js` and `bundle.css` files in `web-app/frontend/public/build/`.

### Running Production Backend

To run the Express backend serving the production build of the frontend:

1.  Ensure the frontend has been built (see "Production Build" above).
2.  Navigate to the `web-app` directory:
    ```bash
    cd web-app
    ```
3.  Start the Express server:
    ```bash
    npm start
    ```
    The server will listen on `http://localhost:3000` and the WebSocket server on `ws://localhost:3001`.

## Docker

The project includes Dockerfiles and Docker Compose configurations for containerized deployment.

*   `Dockerfile.dev`: For building a development image of the web application.
*   `Dockerfile.prod`: For building a production image of the web application.
*   `docker-compose.yml`: Likely for orchestrating multiple services (web-app, Node-RED, Mosquitto) in a development environment.
*   `docker-compose.prod.yml`: For orchestrating services in a production environment.

To build and run services using Docker Compose, you would typically use commands like:

```bash
docker-compose up --build
# or for production
docker-compose -f docker-compose.prod.yml up --build
```

*(Note: Specific service names and configurations would be defined within the `docker-compose.yml` files.)*

## Testing

The root `package.json` indicates a testing setup for Node-RED flows:

```bash
npm test
```
This command will execute tests located in `test/**/*.test.js` using `mocha` and `node-red-node-test-helper`.

# Development Conventions

*   **Frontend (Svelte):** Follows standard Svelte component structure (`.svelte` files for template, script, and style).
*   **Backend (Express.js):** Standard Node.js/Express practices.
*   **Configuration:** Configuration files like `plc_address_map_example.json` are located in the `config/` directory.
*   **Manuals:** Detailed manuals related to Node-RED setup and Modbus data collection are available in the `manual/` directory.
