// src/server.ts
import http from 'http';
import app from './app';
import { initializeSocket } from './config/socket';
import * as auctionService from './services/auction-service';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Set up a timer to check auction status every minute
  setInterval(() => {
    auctionService.updateAuctionStatus()
      .catch(err => console.error('Error updating auction status:', err));
  }, 60000);
});