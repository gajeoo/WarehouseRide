import { useMutation, useQuery } from "convex/react";
import { MessageCircle, Send, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function AdminChatPage() {
  const conversations = useQuery(api.chat.listConversations);
  const [selectedCustomerId, setSelectedCustomerId] = useState<Id<"customers"> | null>(null);
  const selectedConversation = useQuery(
    api.chat.getConversation,
    selectedCustomerId ? { customerId: selectedCustomerId } : "skip"
  );
  const sendMessage = useMutation(api.chat.send);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation]);

  const handleSend = async () => {
    if (!input.trim() || !selectedCustomerId) return;
    const msg = input.trim();
    setInput("");
    await sendMessage({ customerId: selectedCustomerId, message: msg });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chat / Support</h1>
        <p className="text-muted-foreground">Customer messages and support conversations.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Conversations list */}
        <Card className="bg-card/50 border-border overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {conversations?.map((conv) => (
                <button
                  key={conv.customerId}
                  onClick={() => setSelectedCustomerId(conv.customerId as Id<"customers">)}
                  className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${
                    selectedCustomerId === conv.customerId ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="size-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{conv.customerName}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {conv.lastMessage}
                        </div>
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
              {(!conversations || conversations.length === 0) && (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No conversations yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat area */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 border-border flex flex-col h-full min-h-[500px]">
            {selectedCustomerId ? (
              <>
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageCircle className="size-4 text-primary" />
                    {conversations?.find((c) => c.customerId === selectedCustomerId)?.customerName || "Chat"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedConversation?.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.senderRole === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                        msg.senderRole === "admin"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}>
                        {msg.message}
                        <div className={`text-[10px] mt-1 ${
                          msg.senderRole === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"
                        }`}>
                          {new Date(msg._creationTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-3 border-t border-border flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSend}><Send className="size-4" /></Button>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="size-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a customer from the list to start chatting.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
