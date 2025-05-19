// src/components/chat/ChatBox.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from "lucide-react";
import type { Message, User } from '~/types';
import { getMessages } from '~/lib/chat';
import { connectSocket, joinChatRoom, onNewMessage, removeSocketListeners } from '~/lib/socket';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import MessageComponent from './message';
import ChatInput from './chat-input';

interface ChatBoxProps {
  currentUser: User;
}

export default function ChatBox({ currentUser }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Load initial messages
    const loadMessages = async () => {
      try {
        const initialMessages = await getMessages();
        setMessages(initialMessages);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setLoading(false);
      }
    };

    loadMessages();

    // Connect to socket
    const socket = connectSocket(currentUser.id);
    joinChatRoom(currentUser.id);

    // Listen for new messages
    onNewMessage((newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      removeSocketListeners();
    };
  }, [currentUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle>Live Chat</CardTitle>
      </CardHeader>
      <Separator />
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100%-70px)] px-4 py-3">
          <div className="space-y-4 pb-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">No messages yet</div>
              ) : (
                messages.map((message) => (
                  <MessageComponent
                    key={message.id}
                    message={message}
                    isCurrentUser={message.userId === currentUser.id}
                  />
                ))
              )
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <div className="p-4 border-t">
        <ChatInput currentUser={currentUser} onNewMessage={handleNewMessage} />
      </div>
    </Card>
  );
}