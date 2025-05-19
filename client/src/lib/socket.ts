// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';
import type { Auction, Bid, Message } from '~/types';


let socket: Socket | null = null;

export const connectSocket = (userId: string): Socket => {
  if (!socket) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinChatRoom = (userId: string): void => {
  if (socket) {
    socket.emit('join_chat', userId);
  }
};

export const onNewMessage = (callback: (message: Message) => void): void => {
  if (socket) {
    socket.on('new_message', (message: Message) => {
      callback(message);
    });
  }
};



export const removeSocketListeners = (): void => {
  if (socket) {
    socket.off('new_message');
    socket.off('new_bid');
    socket.off('auction_updated');
    socket.off('new_auction');
  }
};

export const joinAuctionRoom = (auctionId: string) => {
  if (socket) {
    socket.emit('join_auction', auctionId);
  }
};

export const leaveAuctionRoom = (auctionId: string) => {
  if (socket) {
    socket.emit('leave_auction', auctionId);
  }
};

export const onNewBid = (callback: (bid: Bid) => void) => {
  if (socket) {
    socket.on('new_bid', callback);
  }
};

export const onAuctionUpdated = (callback: (auction: Auction) => void) => {
  if (socket) {
    socket.on('auction_updated', callback);
  }
};

export const onNewAuction = (callback: (auction: Auction) => void) => {
  if (socket) {
    socket.on('new_auction', callback);
  }
};