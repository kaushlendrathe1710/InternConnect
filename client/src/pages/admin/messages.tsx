import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth, authFetch } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Search,
  Trash2,
  Loader2,
  ArrowLeft,
  Users,
  Clock,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface Conversation {
  id: number;
  employerId: number;
  studentId: number;
  internshipId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  employer: User | null;
  student: User | null;
  messageCount: number;
  lastMessageAt: string | null;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean | null;
  createdAt: string | null;
  sender: User | null;
}

interface ConversationDetail {
  conversation: Conversation;
  messages: Message[];
  employer: User | null;
  student: User | null;
}

export default function AdminMessages() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"message" | "conversation">("message");
  const [itemToDelete, setItemToDelete] = useState<{ id: number; content?: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await authFetch("/api/admin/conversations");
      if (!response.ok) throw new Error("Failed to fetch conversations");
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetail = async (conversationId: number) => {
    setLoadingDetail(true);
    try {
      const response = await authFetch(`/api/admin/conversations/${conversationId}`);
      if (!response.ok) throw new Error("Failed to fetch conversation");
      const data = await response.json();
      setSelectedConversation(data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation details",
        variant: "destructive",
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!itemToDelete || deleteType !== "message") return;
    
    setActionLoading(true);
    try {
      const response = await authFetch(`/api/admin/messages/${itemToDelete.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete message");
      
      if (selectedConversation) {
        setSelectedConversation({
          ...selectedConversation,
          messages: selectedConversation.messages.filter(m => m.id !== itemToDelete.id)
        });
      }
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      
      toast({
        title: "Message Deleted",
        description: "The message has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!itemToDelete || deleteType !== "conversation") return;
    
    setActionLoading(true);
    try {
      const response = await authFetch(`/api/admin/conversations/${itemToDelete.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete conversation");
      
      setConversations(prev => prev.filter(c => c.id !== itemToDelete.id));
      setSelectedConversation(null);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      
      toast({
        title: "Conversation Deleted",
        description: "The conversation and all its messages have been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const employerName = conv.employer?.name?.toLowerCase() || "";
    const employerEmail = conv.employer?.email?.toLowerCase() || "";
    const studentName = conv.student?.name?.toLowerCase() || "";
    const studentEmail = conv.student?.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    
    return employerName.includes(query) || 
           employerEmail.includes(query) ||
           studentName.includes(query) ||
           studentEmail.includes(query);
  });

  const formatTime = (date: string | null) => {
    if (!date) return "N/A";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "N/A";
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2" data-testid="text-page-title">
              <MessageSquare className="w-6 h-6 text-primary" />
              Messages Moderation
            </h1>
            <p className="text-muted-foreground">Monitor and moderate conversations between users</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {conversations.length} Conversations
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
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
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
                  <p>No conversations found</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="divide-y">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                          selectedConversation?.conversation.id === conv.id ? "bg-primary/5 border-l-2 border-primary" : ""
                        }`}
                        onClick={() => fetchConversationDetail(conv.id)}
                        data-testid={`conversation-item-${conv.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {conv.employer?.name || conv.employer?.email || "Unknown"}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {conv.messageCount} msgs
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          ↔ {conv.student?.name || conv.student?.email || "Unknown"}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTime(conv.lastMessageAt || conv.updatedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Conversation Detail */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              {selectedConversation ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedConversation.employer?.name || selectedConversation.employer?.email}
                        {" ↔ "}
                        {selectedConversation.student?.name || selectedConversation.student?.email}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.messages.length} messages
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setDeleteType("conversation");
                      setItemToDelete({ id: selectedConversation.conversation.id });
                      setDeleteDialogOpen(true);
                    }}
                    data-testid="button-delete-conversation"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete All
                  </Button>
                </div>
              ) : (
                <CardTitle className="text-lg text-muted-foreground">
                  Select a conversation to view
                </CardTitle>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {loadingDetail ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : selectedConversation ? (
                <ScrollArea className="h-[450px]">
                  <div className="p-4 space-y-4">
                    {selectedConversation.messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
                        <p>No messages in this conversation</p>
                      </div>
                    ) : (
                      selectedConversation.messages.map((msg) => {
                        const isEmployer = msg.senderId === selectedConversation.employer?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isEmployer ? "justify-end" : "justify-start"}`}
                            data-testid={`message-item-${msg.id}`}
                          >
                            <div className={`max-w-[70%] ${isEmployer ? "order-2" : ""}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className={`text-xs ${isEmployer ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                    {msg.sender?.name?.[0] || msg.sender?.email?.[0] || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium">
                                  {msg.sender?.name || msg.sender?.email || "Unknown"}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {isEmployer ? "Employer" : "Student"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(msg.createdAt)}
                                </span>
                              </div>
                              <div className={`p-3 rounded-lg ${isEmployer ? "bg-green-50 border border-green-100" : "bg-blue-50 border border-blue-100"}`}>
                                <p className="text-sm">{msg.content}</p>
                              </div>
                              <div className="flex justify-end mt-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setDeleteType("message");
                                    setItemToDelete({ id: msg.id, content: msg.content });
                                    setDeleteDialogOpen(true);
                                  }}
                                  data-testid={`button-delete-message-${msg.id}`}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                  <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No conversation selected</p>
                  <p className="text-sm">Click on a conversation to view its messages</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {deleteType === "message" ? "Delete Message" : "Delete Conversation"}
              </DialogTitle>
              <DialogDescription>
                {deleteType === "message" 
                  ? "Are you sure you want to delete this message? This action cannot be undone."
                  : "Are you sure you want to delete this entire conversation and all its messages? This action cannot be undone."
                }
              </DialogDescription>
            </DialogHeader>
            {deleteType === "message" && itemToDelete?.content && (
              <div className="py-4">
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    "{itemToDelete.content}"
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={deleteType === "message" ? handleDeleteMessage : handleDeleteConversation}
                disabled={actionLoading}
                data-testid="button-confirm-delete"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                {deleteType === "message" ? "Delete Message" : "Delete Conversation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
