import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useWebSocket } from "@/lib/use-websocket";
import { 
  Search, 
  Send,
  Paperclip,
  MoreHorizontal,
  Phone,
  Video,
  CheckCheck,
  MessageSquare,
  Loader2,
  Building2
} from "lucide-react";

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ConversationWithDetails {
  id: number;
  employerId: number;
  studentId: number;
  internshipId: number | null;
  createdAt: string;
  updatedAt: string;
  otherUser: {
    id: number;
    name: string;
    email: string;
  } | null;
  lastMessage: Message | null;
  unreadCount: number;
}

export default function StudentMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === "new_message") {
      if (data.conversationId === selectedConversation) {
        setMessages(prev => [...prev, data.message]);
      }
      setConversations(prev => prev.map(conv => {
        if (conv.id === data.conversationId) {
          return {
            ...conv,
            lastMessage: data.message,
            unreadCount: data.conversationId === selectedConversation ? 0 : conv.unreadCount + 1,
          };
        }
        return conv;
      }));
    }
  }, [selectedConversation]);

  useWebSocket(handleWebSocketMessage);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;
      try {
        const data = await api.getConversations(user.id, "student");
        setConversations(data);
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user?.id]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !user?.id) return;
      try {
        const data = await api.getMessages(selectedConversation);
        setMessages(data);
        await api.markAsRead(selectedConversation, user.id);
        setConversations(prev => prev.map(conv => {
          if (conv.id === selectedConversation) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        }));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedConversation, user?.id]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user?.id) return;

    setSendingMessage(true);
    try {
      const newMessage = await api.sendMessage(selectedConversation, user.id, messageInput);
      setMessages(prev => [...prev, newMessage]);
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation) {
          return {
            ...conv,
            lastMessage: newMessage,
            updatedAt: new Date().toISOString(),
          };
        }
        return conv;
      }));
      setMessageInput("");
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const selectedChat = conversations.find(c => c.id === selectedConversation);

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-[600px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">Messages</h1>
          <p className="text-muted-foreground">Chat with employers about your applications</p>
        </div>

        <Card className="overflow-hidden">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className="w-80 border-r flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search employers..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-conversations"
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-1">Apply to internships to start chatting with employers</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedConversation === conv.id ? "bg-blue-50 border-l-2 border-l-primary" : ""
                      }`}
                      onClick={() => setSelectedConversation(conv.id)}
                      data-testid={`conversation-${conv.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-green-100 text-green-700 text-sm font-semibold">
                            {conv.otherUser?.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{conv.otherUser?.name || 'Employer'}</h4>
                            <span className="text-xs text-muted-foreground">
                              {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{conv.otherUser?.email}</p>
                          <p className="text-xs text-slate-600 truncate mt-1">
                            {conv.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-primary text-white text-xs h-5 min-w-5 flex items-center justify-center">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            {selectedChat ? (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                        {selectedChat.otherUser?.name?.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedChat.otherUser?.name || 'Employer'}</h3>
                      <p className="text-xs text-muted-foreground">{selectedChat.otherUser?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" data-testid="button-call">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" data-testid="button-video">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" data-testid="button-more">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Start the conversation by sending a message</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderId === user?.id
                                ? "bg-primary text-white"
                                : "bg-slate-100 text-slate-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              message.senderId === user?.id ? "text-white/70" : "text-muted-foreground"
                            }`}>
                              <span className="text-xs">{formatMessageTime(message.createdAt)}</span>
                              {message.senderId === user?.id && (
                                <CheckCheck className={`w-3 h-3 ${message.isRead ? "" : "opacity-50"}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" data-testid="button-attach">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !sendingMessage && handleSendMessage()}
                      className="flex-1"
                      data-testid="input-message"
                      disabled={sendingMessage}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={sendingMessage || !messageInput.trim()}
                      data-testid="button-send"
                    >
                      {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
