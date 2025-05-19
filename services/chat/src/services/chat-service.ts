// src/services/chatService.ts
import prisma from '../models';
import { CreateMessageInput, MessageDTO } from '../types';
import { io } from '../config/socket';

export const createMessage = async (messageData: CreateMessageInput): Promise<MessageDTO> => {
  const message = await prisma.message.create({
    data: messageData,
    include: {
      user: true
    }
  });

  // Emit message to all connected clients in the chat room
  io.to('chat_room').emit('new_message', message);

  return message;
};

export const getMessages = async (): Promise<MessageDTO[]> => {
  return prisma.message.findMany({
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
};
