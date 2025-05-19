// src/components/chat/ChatInput.tsx
"use client";


import { useState } from 'react';

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader2, Send } from "lucide-react";
import type { Message, User } from '~/types';
import { sendMessage } from '~/lib/chat';

interface ChatInputProps {
  currentUser: User;
  onNewMessage: (message: Message) => void;
}

export default function ChatInput({ currentUser, onNewMessage }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    try {
      setSending(true);
      
      const message = await sendMessage(content.trim(), currentUser.id);
      
      // Reset form
      setContent('');
      setSending(false);
      
      // No need to manually add the message as it will come through the socket
    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={sending}
        placeholder="Type your message..."
        className="flex-1"
      />
      <Button 
        type="submit"
        disabled={sending || !content.trim()}
        size="icon"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}