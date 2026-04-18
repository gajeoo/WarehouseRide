import { MessageCircle, Send, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FAQ: Record<string, string> = {
  "pricing": "Our pricing is flexible:\n• Monthly: $280–$350\n• Bi-weekly: $155–$175\n• Weekly: $50\n• Daily: $17–$22\nAll prices are round-trip and subject to change based on fuel costs.",
  "price": "Our pricing is flexible:\n• Monthly: $280–$350\n• Bi-weekly: $155–$175\n• Weekly: $50\n• Daily: $17–$22\nAll prices are round-trip and subject to change based on fuel costs.",
  "cost": "Our pricing is flexible:\n• Monthly: $280–$350\n• Bi-weekly: $155–$175\n• Weekly: $50\n• Daily: $17–$22\nAll prices are round-trip and subject to change based on fuel costs.",
  "area": "We serve the Baltimore metro area including:\n• Baltimore\n• Columbia\n• Laurel\n• Elkridge\n• Jessup\n• Ellicott City\n• Silver Spring",
  "route": "We pick up from home addresses and transport employees to the same workplace. Think of it like a school bus for the workforce! We accommodate all shifts.",
  "shift": "We accommodate ALL shifts — morning, afternoon, night, early, and late schedules. Just let us know your work hours!",
  "minimum": "We require a minimum of 8 passengers per single job location to optimize our routes and keep pricing affordable.",
  "sign up": "You can sign up by clicking 'Get Started' at the top of the page, or request a quote for your team through our Get a Quote page!",
  "contact": "You can reach us through our Contact page or by requesting a quote. We'll get back to you within 24 hours!",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(FAQ)) {
    if (lower.includes(key)) return response;
  }
  return "Thanks for your question! For detailed inquiries, please use our Contact form or Get a Quote page. Our team will respond within 24 hours.\n\nCommon topics I can help with:\n• Pricing\n• Service areas\n• Routes & shifts\n• Minimum passengers\n• How to sign up";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! 👋 I'm the WarehouseRide assistant. How can I help you today?\n\nAsk me about pricing, service areas, routes, or shifts!" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: getResponse(userMsg) },
      ]);
    }, 500);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[480px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-sm">WarehouseRide Assistant</h3>
            <p className="text-xs text-muted-foreground">Ask about pricing, routes, and more</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={`msg-${i}-${msg.role}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a question..."
              className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
            <Button size="sm" onClick={handleSend} className="shrink-0">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
