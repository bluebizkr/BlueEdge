# Web Application

This directory contains the web application component of the PLC monitoring system. It consists of a Svelte-based frontend and an Express.js backend.

## Overview

The web application provides a real-time dashboard for monitoring PLC data.

*   **Frontend (Svelte):** A single-page application that displays PLC data. It fetches initial configuration (PLC address map) from the backend and receives live updates via WebSockets.
*   **Backend (Express.js):** Serves the Svelte frontend, provides an API endpoint for the PLC address map, and hosts a WebSocket server to push real-time data to the frontend.

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm

### Installation

1.  Navigate to the `web-app` directory:
    ```bash
    cd web-app
    ```
2.  Install backend dependencies:
    ```bash
    npm install
    ```
3.  Install frontend dependencies:
    ```bash
    npm install --prefix frontend
    ```

### Development

To run the web application in development mode (with live reloading for the frontend):

1.  Ensure you are in the `web-app` directory.
2.  Start the development server:
    ```bash
    npm run dev
    ```
    The Express backend will listen on `http://localhost:3000` and the WebSocket server on `ws://localhost:3001`. The Svelte frontend will be served by its own development server, typically accessible via `http://localhost:8080` (or similar, as configured by `sirv-cli` and `rollup-plugin-livereload`).

### Production Build

To build the Svelte frontend for production:

1.  Ensure you are in the `web-app` directory.
2.  Run the build script:
    ```bash
    npm run build
    ```
    This will generate optimized `bundle.js` and `bundle.css` files in `web-app/frontend/public/build/`.

### Running Production Backend

To run the Express backend serving the production build of the frontend:

1.  Ensure the frontend has been built (see "Production Build" above).
2.  Ensure you are in the `web-app` directory.
3.  Start the Express server:
    ```bash
    npm start
    ```
    The server will listen on `http://localhost:3000` and the WebSocket server on `ws://localhost:3001`.

## Project Structure

```
web-app/
├── Dockerfile.dev         # Dockerfile for development environment
├── Dockerfile.prod        # Dockerfile for production environment
├── package.json           # Backend dependencies and scripts
├── server.js              # Express.js backend server
└── frontend/
    ├── package.json       # Frontend dependencies and scripts
    ├── rollup.config.js   # Rollup configuration for Svelte build
    ├── public/            # Static assets (index.html, global.css, build output)
    │   ├── global.css
    │   ├── index.html
    │   └── build/         # Compiled Svelte assets (bundle.js, bundle.css)
    └── src/
        ├── App.svelte     # Main Svelte component
        └── main.js        # Svelte application entry point
```
