// src/components/chat/Message.tsx

import { format } from 'date-fns';
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import type { Message } from '~/types';

interface MessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function MessageComponent({ message, isCurrentUser }: MessageProps) {
  const formattedTime = typeof message.createdAt === 'string' 
    ? format(new Date(message.createdAt), 'HH:mm')
    : format(message.createdAt, 'HH:mm');

  const userInitials = (message.user?.name || 'User').split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className={`flex items-start gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex flex-col">
        {!isCurrentUser && (
          <span className="text-sm font-medium mb-1">
            {message.user?.name || 'Unknown User'}
          </span>
        )}
        
        <div className={cn(
          "max-w-xs sm:max-w-md px-3 py-2 rounded-lg text-sm",
          isCurrentUser 
            ? "bg-primary text-primary-foreground rounded-br-none ml-auto" 
            : "bg-muted rounded-bl-none"
        )}>
          <div className="break-words">{message.content}</div>
          <div className={cn(
            "text-xs mt-1 ml-auto text-right",
            isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
}
