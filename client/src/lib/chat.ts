import axios from 'axios';
import type { Auction, Bid, Message, User } from '~/types';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const createUser = async (name: string): Promise<User> => {
  const response = await api.post('/users', { name });
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

// Chat API
export const sendMessage = async (content: string, userId: string): Promise<Message> => {
  const response = await api.post('/messages', { content, userId });
  return response.data;
};

export const getMessages = async (): Promise<Message[]> => {
  const response = await api.get('/messages');
  return response.data;
};

// Auction API
export const createAuction = async (auctionData: {
  title: string;
  description: string;
  imageUrl?: string;
  startPrice: number;
  startTime: Date;
  endTime: Date;
  createdBy: string;
}): Promise<Auction> => {
  const response = await api.post('/auctions', auctionData);
  return response.data;
};

export const getAuctions = async (): Promise<Auction[]> => {
  const response = await api.get('/auctions');
  return response.data;
};

export const getAuctionById = async (id: string): Promise<Auction> => {
  const response = await api.get(`/auctions/${id}`);
  return response.data;
};

export const placeBid = async (
  auctionId: string,
  userId: string,
  amount: number
): Promise<Bid> => {
  const response = await api.post(`/auctions/${auctionId}/bids`, {
    userId,
    amount,
  });
  return response.data;
};
