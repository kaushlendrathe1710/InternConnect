import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Send,
  Paperclip,
  MoreHorizontal,
  Phone,
  Video,
  Clock,
  CheckCheck,
  MessageSquare
} from "lucide-react";

interface Message {
  id: number;
  sender: "employer" | "applicant";
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: number;
  applicantName: string;
  appliedFor: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

export default function EmployerMessages() {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      applicantName: "Rahul Sharma",
      appliedFor: "Full Stack Developer Intern",
      lastMessage: "Thank you for the opportunity! I'm very excited about this role.",
      lastMessageTime: "2 min ago",
      unreadCount: 2,
      isOnline: true,
      messages: [
        { id: 1, sender: "employer", content: "Hi Rahul, we were impressed by your application for the Full Stack Developer Intern position. Would you be available for a technical interview this week?", timestamp: "10:30 AM", isRead: true },
        { id: 2, sender: "applicant", content: "Hi! Thank you so much for considering my application. Yes, I'm available this week. I can do any day between Tuesday to Friday.", timestamp: "10:45 AM", isRead: true },
        { id: 3, sender: "employer", content: "Great! Let's schedule it for Thursday at 3 PM. The interview will be conducted via Google Meet. I'll send you the link shortly.", timestamp: "11:00 AM", isRead: true },
        { id: 4, sender: "applicant", content: "Perfect! Thursday at 3 PM works great for me. I'll be prepared and waiting for the link. Is there anything specific I should prepare or review beforehand?", timestamp: "11:15 AM", isRead: true },
        { id: 5, sender: "employer", content: "Please review React hooks, Node.js basics, and be ready to discuss your past projects. Also, feel free to ask any questions about the role during the interview.", timestamp: "11:30 AM", isRead: true },
        { id: 6, sender: "applicant", content: "Thank you for the opportunity! I'm very excited about this role.", timestamp: "11:45 AM", isRead: false }
      ]
    },
    {
      id: 2,
      applicantName: "Priya Patel",
      appliedFor: "Full Stack Developer Intern",
      lastMessage: "I've attached my updated portfolio as requested.",
      lastMessageTime: "1 hour ago",
      unreadCount: 0,
      isOnline: false,
      messages: [
        { id: 1, sender: "employer", content: "Hi Priya, thank you for applying. Could you share your portfolio?", timestamp: "Yesterday", isRead: true },
        { id: 2, sender: "applicant", content: "Sure! Here's my portfolio link: portfolio.priya.dev", timestamp: "Yesterday", isRead: true },
        { id: 3, sender: "employer", content: "Great work! Could you also attach your updated resume with recent projects?", timestamp: "Today", isRead: true },
        { id: 4, sender: "applicant", content: "I've attached my updated portfolio as requested.", timestamp: "1 hour ago", isRead: true }
      ]
    },
    {
      id: 3,
      applicantName: "Amit Kumar",
      appliedFor: "Social Media Marketing Intern",
      lastMessage: "When can we schedule the interview?",
      lastMessageTime: "Yesterday",
      unreadCount: 1,
      isOnline: true,
      messages: [
        { id: 1, sender: "employer", content: "Hi Amit, we found your social media marketing experience impressive!", timestamp: "2 days ago", isRead: true },
        { id: 2, sender: "applicant", content: "Thank you! I'm really interested in this opportunity.", timestamp: "2 days ago", isRead: true },
        { id: 3, sender: "applicant", content: "When can we schedule the interview?", timestamp: "Yesterday", isRead: false }
      ]
    },
    {
      id: 4,
      applicantName: "Sneha Reddy",
      appliedFor: "Full Stack Developer Intern",
      lastMessage: "Looking forward to joining the team!",
      lastMessageTime: "2 days ago",
      unreadCount: 0,
      isOnline: false,
      messages: [
        { id: 1, sender: "employer", content: "Congratulations Sneha! We'd like to offer you the Full Stack Developer Intern position.", timestamp: "2 days ago", isRead: true },
        { id: 2, sender: "applicant", content: "Thank you so much! I'm thrilled to accept the offer!", timestamp: "2 days ago", isRead: true },
        { id: 3, sender: "employer", content: "Welcome aboard! HR will send you the joining details soon.", timestamp: "2 days ago", isRead: true },
        { id: 4, sender: "applicant", content: "Looking forward to joining the team!", timestamp: "2 days ago", isRead: true }
      ]
    }
  ]);

  const selectedChat = conversations.find(c => c.id === selectedConversation);

  const filteredConversations = conversations.filter(conv =>
    conv.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.appliedFor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    const newMessage: Message = {
      id: Date.now(),
      sender: "employer",
      content: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageInput,
          lastMessageTime: "Just now"
        };
      }
      return conv;
    }));

    setMessageInput("");
    toast({
      title: "Message sent",
      description: `Your message to ${selectedChat?.applicantName} has been sent.`,
    });
  };

  const handleSelectConversation = (convId: number) => {
    setSelectedConversation(convId);
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    }));
  };

  return (
    <DashboardLayout role="employer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">Messages</h1>
          <p className="text-muted-foreground">Communicate with applicants and manage conversations</p>
        </div>

        <Card className="overflow-hidden">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className="w-80 border-r flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-conversations"
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedConversation === conv.id ? "bg-blue-50 border-l-2 border-l-primary" : ""
                    }`}
                    onClick={() => handleSelectConversation(conv.id)}
                    data-testid={`conversation-${conv.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {conv.applicantName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conv.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{conv.applicantName}</h4>
                          <span className="text-xs text-muted-foreground">{conv.lastMessageTime}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.appliedFor}</p>
                        <p className="text-xs text-slate-600 truncate mt-1">{conv.lastMessage}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-primary text-white text-xs h-5 min-w-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            {selectedChat ? (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {selectedChat.applicantName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedChat.applicantName}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {selectedChat.isOnline ? (
                          <><span className="w-2 h-2 bg-green-500 rounded-full"></span> Online</>
                        ) : (
                          <><Clock className="w-3 h-3" /> Last seen recently</>
                        )}
                      </p>
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
                    {selectedChat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "employer" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender === "employer"
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            message.sender === "employer" ? "text-white/70" : "text-muted-foreground"
                          }`}>
                            <span className="text-xs">{message.timestamp}</span>
                            {message.sender === "employer" && (
                              <CheckCheck className={`w-3 h-3 ${message.isRead ? "" : "opacity-50"}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                      data-testid="input-message"
                    />
                    <Button onClick={handleSendMessage} data-testid="button-send">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
