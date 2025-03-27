import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

interface Client {
  id: string;
  socket: WebSocket;
  lastHeartbeat: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Track connected clients
  const clients: Map<string, Client> = new Map();
  let clientIdCounter = 0;

  // Handle WebSocket connections
  wss.on('connection', (socket, req) => {
    const clientId = (++clientIdCounter).toString();
    const client: Client = {
      id: clientId,
      socket,
      lastHeartbeat: Date.now()
    };
    
    clients.set(clientId, client);
    
    console.log(`Client ${clientId} connected. Total clients: ${clients.size}`);
    
    // Send welcome message
    socket.send(JSON.stringify({ type: 'connection', status: 'connected', clientId }));
    
    // Handle messages from clients
    socket.on('message', async (message) => {
      try {
        // Parse message
        const data = JSON.parse(message.toString());
        client.lastHeartbeat = Date.now();
        
        // If it's hand tracking data
        if (data.hand) {
          // Store in database if needed
          // For now, we're just echoing back the data
          socket.send(JSON.stringify({ 
            type: 'handData',
            status: 'received',
            timestamp: Date.now()
          }));
        }
        
        // Handle heartbeat messages
        if (data.type === 'heartbeat') {
          socket.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    // Handle client disconnection
    socket.on('close', () => {
      clients.delete(clientId);
      console.log(`Client ${clientId} disconnected. Remaining clients: ${clients.size}`);
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error(`Client ${clientId} error:`, error);
      clients.delete(clientId);
    });
  });
  
  // Set up interval to check for stale connections (30s timeout)
  const interval = setInterval(() => {
    const now = Date.now();
    clients.forEach((client, id) => {
      if (now - client.lastHeartbeat > 30000) {
        console.log(`Client ${id} timed out`);
        
        if (client.socket.readyState === WebSocket.OPEN) {
          client.socket.terminate();
        }
        
        clients.delete(id);
      }
    });
  }, 10000);
  
  // Clean up interval when server closes
  httpServer.on('close', () => {
    clearInterval(interval);
  });
  
  // API endpoints
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      clients: clients.size,
      uptime: process.uptime()
    });
  });

  return httpServer;
}
