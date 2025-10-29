import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Send, Search, Plus, Paperclip, Smile, MoreVertical, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Message {
  id: string;
  sender: string;
  senderRole: string;
  content: string;
  timestamp: string;
  read: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface Conversation {
  id: string;
  participant: string;
  participantRole: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

export function MessagesPage() {
  const { user } = useApp();
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [scheduledSend, setScheduledSend] = useState(false);

  // Mock data
  const conversations: Conversation[] = [
    {
      id: '1',
      participant: 'Michael Chen',
      participantRole: 'Teacher',
      lastMessage: 'Thanks for submitting the assignment on time!',
      timestamp: '10:30 AM',
      unread: 0,
      messages: [
        { id: 'm1', sender: 'John Smith', senderRole: 'Student', content: 'Hello Mr. Chen, I have a question about the homework.', timestamp: '9:15 AM', read: true, sentiment: 'neutral' },
        { id: 'm2', sender: 'Michael Chen', senderRole: 'Teacher', content: 'Sure! What do you need help with?', timestamp: '9:20 AM', read: true, sentiment: 'positive' },
        { id: 'm3', sender: 'John Smith', senderRole: 'Student', content: 'I\'m stuck on problem #5. Could you explain the approach?', timestamp: '9:25 AM', read: true, sentiment: 'neutral' },
        { id: 'm4', sender: 'Michael Chen', senderRole: 'Teacher', content: 'Of course! Try breaking it down into smaller steps first. Start by identifying what you know and what you need to find.', timestamp: '9:30 AM', read: true, sentiment: 'positive' },
        { id: 'm5', sender: 'John Smith', senderRole: 'Student', content: 'Got it! That makes sense now. Thank you!', timestamp: '10:00 AM', read: true, sentiment: 'positive' },
        { id: 'm6', sender: 'Michael Chen', senderRole: 'Teacher', content: 'Thanks for submitting the assignment on time!', timestamp: '10:30 AM', read: true, sentiment: 'positive' },
      ]
    },
    {
      id: '2',
      participant: 'Emily Rodriguez',
      participantRole: 'Teacher',
      lastMessage: 'The lab report deadline has been extended to Friday.',
      timestamp: 'Yesterday',
      unread: 2,
      messages: [
        { id: 'm7', sender: 'Emily Rodriguez', senderRole: 'Teacher', content: 'The lab report deadline has been extended to Friday.', timestamp: 'Yesterday', read: false, sentiment: 'positive' },
        { id: 'm8', sender: 'Emily Rodriguez', senderRole: 'Teacher', content: 'Make sure to include all data tables.', timestamp: 'Yesterday', read: false, sentiment: 'neutral' },
      ]
    },
    {
      id: '3',
      participant: 'Parent Group - Grade 10',
      participantRole: 'Group',
      lastMessage: 'Field trip permission forms are due next week.',
      timestamp: '2 days ago',
      unread: 0,
      messages: [
        { id: 'm9', sender: 'Sarah Johnson', senderRole: 'Admin', content: 'Field trip permission forms are due next week.', timestamp: '2 days ago', read: true, sentiment: 'neutral' },
      ]
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.participant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = conversations.find(c => c.id === selectedConversation);

  const getSentimentBadge = (sentiment?: string) => {
    if (!sentiment) return null;
    const colors = {
      positive: 'bg-green-500/10 text-green-400',
      neutral: 'bg-gray-500/10 text-gray-400',
      negative: 'bg-red-500/10 text-red-400'
    };
    return (
      <Badge className={`${colors[sentiment as keyof typeof colors]} text-xs`}>
        AI: {sentiment}
      </Badge>
    );
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In real app, this would send the message
      setNewMessage('');
    }
  };

  return (
    <div className="p-6 h-full">
      <Card className="bg-gray-800 border-gray-700 h-[calc(100vh-120px)]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-700 flex flex-col">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-white">Messages</CardTitle>
                <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">New Message</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Start a new conversation
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-300">To:</label>
                        <Select>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select recipient" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="teacher1">Michael Chen (Teacher)</SelectItem>
                            <SelectItem value="teacher2">Emily Rodriguez (Teacher)</SelectItem>
                            <SelectItem value="admin">Sarah Johnson (Admin)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-300">Message:</label>
                        <Textarea
                          className="bg-gray-700 border-gray-600 text-white"
                          rows={4}
                          placeholder="Type your message..."
                        />
                      </div>
                      {user?.role === 'teacher' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="schedule"
                            checked={scheduledSend}
                            onChange={(e) => setScheduledSend(e.target.checked)}
                            className="rounded border-gray-600 bg-gray-700 text-blue-600"
                          />
                          <label htmlFor="schedule" className="text-sm text-gray-300 cursor-pointer flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Schedule send
                          </label>
                        </div>
                      )}
                      {scheduledSend && (
                        <Input
                          type="datetime-local"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsNewMessageOpen(false)} className="border-gray-600 text-gray-300">
                          Cancel
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </CardHeader>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-700/50 transition-colors border-b border-gray-700 ${
                    selectedConversation === conv.id ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="bg-blue-600">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {conv.participant.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white truncate">{conv.participant}</h4>
                        {conv.unread > 0 && (
                          <Badge className="bg-blue-600 text-white">{conv.unread}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{conv.participantRole}</span>
                        <span className="text-xs text-gray-500">{conv.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="bg-blue-600">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {activeConversation.participant.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-white">{activeConversation.participant}</h3>
                      <p className="text-sm text-gray-400">{activeConversation.participantRole}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeConversation.messages.map((message) => {
                    const isCurrentUser = message.sender === user?.name;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {!isCurrentUser && (
                              <span className="text-sm text-gray-400">{message.sender}</span>
                            )}
                            <span className="text-xs text-gray-500">{message.timestamp}</span>
                            {!isCurrentUser && getSentimentBadge(message.sentiment)}
                          </div>
                          <div
                            className={`p-3 rounded-lg ${
                              isCurrentUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-100'
                            }`}
                          >
                            <p>{message.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-400">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-gray-700 border-gray-600 text-white"
                    />
                    <Button variant="ghost" size="icon" className="text-gray-400">
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {user?.role === 'teacher' && (
                    <p className="text-xs text-gray-500 mt-2">
                      💡 AI Sentiment Analysis: Messages are automatically analyzed for tone
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
