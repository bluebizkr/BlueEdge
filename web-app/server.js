const express = require('express');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// Serve static files from the Svelte frontend
app.use(express.static(path.join(__dirname, 'frontend/public')));

// API endpoint to get plc_address_map.json
app.get('/api/plc-address-map', (req, res) => {
  const filePath = path.join(__dirname, '../config/plc_address_map_example.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading PLC address map:', err);
      return res.status(500).send('Error reading PLC address map');
    }
    res.json(JSON.parse(data));
  });
});

// WebSocket server setup
const websocketPort = 3001;
const wss = new WebSocket.Server({ port: websocketPort }); // WebSocket server on port 3001

wss.on('connection', ws => {
  console.log('WebSocket client connected');

  ws.on('message', message => {
  console.log(`Received message from client: ${message}`);
  try {
    const parsedMessage = JSON.parse(message);
    app.locals.sendWebSocketMessage(parsedMessage);
  } catch (error) {
    console.error('Error parsing WebSocket message from client:', error);
  }
});

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});

// Function to send data to all connected WebSocket clients
app.locals.sendWebSocketMessage = (data) => {
  console.log('Attempting to send WebSocket message to frontend:', data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Example of how Node-RED might send data to this WebSocket server
// This part is illustrative and would be handled by Node-RED's websocket-out node
// app.post('/api/websocket-data', express.json(), (req, res) => {
//   const data = req.body;
//   app.locals.sendWebSocketMessage(data);
//   res.status(200).send('Data sent to WebSocket clients');
// });

app.listen(port, () => {
  console.log(`Web application backend listening on port ${port}`);
});

console.log(`WebSocket server started on port ${websocketPort}`);
