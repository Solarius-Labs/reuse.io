// src/config/socket.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

export let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Join chat room
    socket.on('join_chat', (userId: string) => {
      socket.join('chat_room');
      console.log(`User ${userId} joined chat room`);
    });

    // Join auction room
    socket.on('join_auction', (auctionId: string) => {
      socket.join(`auction_${auctionId}`);
      console.log(`Client joined auction room: ${auctionId}`);
    });

    // Leave auction room
    socket.on('leave_auction', (auctionId: string) => {
      socket.leave(`auction_${auctionId}`);
      console.log(`Client left auction room: ${auctionId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};