// src/controllers/chatController.ts
import { Request, Response } from 'express';
import * as chatService from '../services/chat-service';
import { CreateMessageInput } from '../types';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const messageData: CreateMessageInput = req.body;
    const message = await chatService.createMessage(messageData);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await chatService.getMessages();
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};