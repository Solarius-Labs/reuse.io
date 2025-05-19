"use client";


import { useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Loader2, LogOut } from "lucide-react";
import type { User } from '~/types';
import { createUser, getUsers } from '~/lib/chat';
import ChatBox from '~/components/chat/chat-box';

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserName, setNewUserName] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
        setLoading(false);
        
        // Use stored user if available
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          const foundUser = fetchedUsers.find(user => user.id === storedUserId);
          if (foundUser) {
            setCurrentUser(foundUser);
          }
        }
      } catch (error) {
        console.error('Failed to load users:', error);
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserName.trim()) return;
    
    try {
      setCreatingUser(true);
      const user = await createUser(newUserName.trim());
      setUsers([...users, user]);
      setCurrentUser(user);
      localStorage.setItem('userId', user.id);
      setNewUserName('');
      setCreatingUser(false);
    } catch (error) {
      console.error('Error creating user:', error);
      setCreatingUser(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('userId', user.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Auction Chat App</h1>
      
      {!currentUser ? (
        <Card>
          <CardHeader>
            <CardTitle>Join the Chat</CardTitle>
            <CardDescription>Select an existing user or create a new one</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue={users.length > 0 ? "existing" : "new"}>
              <TabsList className="mb-4">
                {users.length > 0 && (
                  <TabsTrigger value="existing">Existing User</TabsTrigger>
                )}
                <TabsTrigger value="new">New User</TabsTrigger>
              </TabsList>
              
              {users.length > 0 && (
                <TabsContent value="existing">
                  <div className="mb-4">
                    <Label className="mb-2 block">Select a user</Label>
                    <ScrollArea className="h-[200px] border rounded-md p-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {users.map((user) => (
                          <Button
                            key={user.id}
                            variant="outline"
                            onClick={() => handleSelectUser(user)}
                            className="justify-start h-auto py-2 px-3"
                          >
                            {user.name}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              )}
              
              <TabsContent value="new">
                <form onSubmit={handleCreateUser}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Enter your name"
                        disabled={creatingUser}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={creatingUser || !newUserName.trim()}
                      className="w-full"
                    >
                      {creatingUser ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                        </>
                      ) : 'Join Chat'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden h-[80vh]">
          <div className="bg-card p-4 border-b flex justify-between items-center">
            <div>
              <span className="font-medium mr-1">Logged in as:</span>
              <span className="text-primary">{currentUser.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCurrentUser(null);
                localStorage.removeItem('userId');
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Switch User
            </Button>
          </div>
          <div className="h-[calc(100%-64px)]">
            <ChatBox currentUser={currentUser} />
          </div>
        </Card>
      )}
    </div>
  );
}