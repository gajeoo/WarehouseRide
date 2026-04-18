import { useMutation } from "convex/react";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";

export function ContactPage() {
  const submitContact = useMutation(api.contact.submit);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await submitContact({
        name: data.get("name") as string,
        email: data.get("email") as string,
        subject: data.get("subject") as string,
        message: data.get("message") as string,
      });
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setSent(true);
    } catch {
      toast.error("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and we'll respond within 24 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {sent ? (
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="size-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="size-8 text-success" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" required placeholder="Your name" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required placeholder="you@email.com" className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" placeholder="What's this about?" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" name="message" required placeholder="How can we help?" rows={5} className="mt-1" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            {[
              { icon: Mail, title: "Email", content: "info@warehouseride.com" },
              { icon: Phone, title: "Phone", content: "(410) 555-RIDE" },
              { icon: MapPin, title: "Service Area", content: "Baltimore Metro Area, MD" },
            ].map((item) => (
              <Card key={item.title} className="bg-card/50 border-border">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.content}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
