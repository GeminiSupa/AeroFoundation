import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Send, Search, Plus, Paperclip, MoreVertical, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, sendMessage, getUnreadCount, getEligibleRecipients, markMessageAsRead } from '../../lib/api/communication';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { supabase } from '../../lib/supabaseClient';

const messageSchema = z.object({
  recipientId: z.string().min(1, 'Please select a recipient'),
  message: z.string().min(1, 'Message cannot be empty'),
  subject: z.string().optional(),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  message: string;
  timestamp: string;
  read: boolean;
  subject?: string;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

export function MessagesPage() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Fetch received messages (inbox)
  const { data: receivedMsgs, isLoading: loadingReceived } = useQuery({
    queryKey: ['messages', 'received', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await getMessages({ recipientId: user.id });
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch sent messages
  const { data: sentMsgs, isLoading: loadingSent } = useQuery({
    queryKey: ['messages', 'sent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await getMessages({ senderId: user.id });
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
    enabled: !!user?.id && activeTab === 'sent',
  });

  // Fetch unread count
  const { data: unread } = useQuery({
    queryKey: ['unreadCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const res = await getUnreadCount(user.id);
      return res.success ? (res.data || 0) : 0;
    },
    enabled: !!user?.id,
  });

  // Fetch eligible recipients for new message
  const { data: recipients } = useQuery({
    queryKey: ['recipients', user?.id, user?.role],
    queryFn: async () => {
      if (!user?.id || !user?.role) return [];
      const res = await getEligibleRecipients(user.id, user.role);
      return res.success ? (res.data || []) : [];
    },
    enabled: !!user?.id && !!user?.role && isNewMessageOpen,
  });

  // Real-time subscription for instant message updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('messages_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'internal_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
          
          // Show toast notification for new messages
          if (payload.eventType === 'INSERT') {
            toast.success('New message received!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Form for new message
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      recipientId: '',
      message: '',
      subject: '',
    },
  });

  // Get messages based on active tab
  const allMessages = activeTab === 'inbox' ? (receivedMsgs || []) : (sentMsgs || []);

  // Group messages into conversations
  const conversations: Conversation[] = useMemo(() => {
    const groups = new Map<string, Conversation>();
    
    allMessages.forEach((m: any) => {
      // Determine the other participant
      const isFromMe = m.sender_id === user?.id;
      const participantId = isFromMe ? m.recipient_id : m.sender_id;
      const participantName = isFromMe ? m.recipient_name : m.sender_name;
      
      const existing = groups.get(participantId);
      const message: Message = {
        id: m.id,
        sender_id: m.sender_id,
        sender_name: m.sender_name || 'User',
        recipient_id: m.recipient_id,
        message: m.message,
        timestamp: new Date(m.created_at).toLocaleString(),
        read: m.is_read || false,
        subject: m.subject,
      };
      
      if (!existing) {
        groups.set(participantId, {
          id: participantId,
          participantId,
          participantName,
          participantRole: '',
          lastMessage: m.message,
          timestamp: new Date(m.created_at).toLocaleString(),
          unread: activeTab === 'inbox' && !m.is_read ? 1 : 0,
          messages: [message],
        });
      } else {
        existing.messages.push(message);
        existing.lastMessage = m.message;
        existing.timestamp = new Date(m.created_at).toLocaleString();
        if (activeTab === 'inbox' && !m.is_read) existing.unread += 1;
      }
    });
    
    return Array.from(groups.values());
  }, [allMessages, activeTab, user?.id]);

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = conversations.find(c => c.id === selectedConversation);

  // Send new message mutation
  const sendMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      if (!user?.id) throw new Error('Not logged in');
      return await sendMessage({
        sender_id: user.id,
        recipient_id: data.recipientId,
        subject: data.subject || '',
        message: data.message,
      });
    },
    onSuccess: () => {
      toast.success('Message sent!');
      setIsNewMessageOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message');
    },
  });

  // Send reply mutation
  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user?.id || !activeConversation) throw new Error('Missing data');
      return await sendMessage({
        sender_id: user.id,
        recipient_id: activeConversation.participantId,
        subject: '',
        message: message,
      });
    },
    onSuccess: () => {
      setNewMessage('');
      toast.success('Message sent!');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message');
    },
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await markMessageAsRead(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const handleSendNewMessage = form.handleSubmit((data) => {
    sendMutation.mutate(data);
  });

  const handleSendReply = () => {
    if (!newMessage.trim() || !activeConversation) return;
    replyMutation.mutate(newMessage.trim());
  };

  // Select conversation and mark as read
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv.id);
    // Mark unread messages as read
    conv.messages
      .filter(m => !m.read && m.recipient_id === user?.id)
      .forEach(m => markReadMutation.mutate(m.id));
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-module-messages">
            <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8" />
            Messages
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Internal messaging system</p>
        </div>
        <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-module-messages hover:bg-module-messages/90">
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose New Message</DialogTitle>
              <DialogDescription>
                Send a message to another user in the system
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={handleSendNewMessage} className="space-y-4">
                <FormField
                  control={form.control}
                  name="recipientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a recipient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {recipients?.map((recipient) => (
                            <SelectItem key={recipient.id} value={recipient.id}>
                              {recipient.full_name || recipient.email} ({recipient.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter subject..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={6} placeholder="Type your message here..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewMessageOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sendMutation.isPending}>
                    {sendMutation.isPending ? 'Sending...' : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Messages</p>
            <h2 className="mt-2 text-3xl">{conversations.length}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Unread</p>
            <h2 className="mt-2 text-3xl text-sap-critical">{unread || 0}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Sent</p>
            <h2 className="mt-2 text-3xl">{sentMsgs?.length || 0}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Received</p>
            <h2 className="mt-2 text-3xl">{receivedMsgs?.length || 0}</h2>
          </CardContent>
        </Card>
      </div>

      <Card className="h-[calc(100vh-400px)]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-80 border-r flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Conversations</CardTitle>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="inbox">Inbox {unread ? `(${unread})` : ''}</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex-1 overflow-y-auto">
              {(activeTab === 'inbox' ? loadingReceived : loadingSent) ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No {activeTab === 'inbox' ? 'received' : 'sent'} messages yet
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 cursor-pointer border-b transition-colors ${
                      selectedConversation === conv.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {conv.participantName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium truncate">{conv.participantName}</h4>
                          {conv.unread > 0 && (
                            <Badge className="bg-sap-critical text-white">{conv.unread}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                        <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {activeConversation.participantName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{activeConversation.participantName}</h3>
                      <p className="text-sm text-muted-foreground">{activeConversation.participantRole}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeConversation.messages.map((message) => {
                    const isCurrentUser = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {!isCurrentUser && (
                              <span className="text-sm font-medium">{message.sender_name}</span>
                            )}
                            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          </div>
                          <div
                            className={`p-3 rounded-lg ${
                              isCurrentUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p>{message.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendReply} 
                    disabled={replyMutation.isPending || !newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
