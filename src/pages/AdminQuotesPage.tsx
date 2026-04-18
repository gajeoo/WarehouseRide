import { useMutation, useQuery } from "convex/react";
import { Calendar, FileText, Mail, MapPin, Phone, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "../../convex/_generated/api";

export function AdminQuotesPage() {
  const quotes = useQuery(api.quotes.list);
  const updateStatus = useMutation(api.quotes.updateStatus);

  const handleStatus = async (id: string, status: "reviewed" | "contacted" | "converted" | "rejected") => {
    try {
      await updateStatus({ id: id as any, status });
      toast.success(`Quote marked as ${status}`);
    } catch {
      toast.error("Failed to update.");
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-info/10 text-info border-info/20";
      case "reviewed": return "bg-warning/10 text-warning border-warning/20";
      case "contacted": return "bg-primary/10 text-primary border-primary/20";
      case "converted": return "bg-success/10 text-success border-success/20";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quote Requests</h1>
        <p className="text-muted-foreground">{quotes?.length || 0} total quote requests</p>
      </div>

      <div className="space-y-4">
        {quotes?.map((q) => (
          <Card key={q._id} className="bg-card/50 border-border">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{q.name}</h3>
                    <Badge className={`text-xs capitalize ${statusColor(q.status)}`}>
                      {q.status}
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Mail className="size-3.5" /> {q.email}</div>
                    {q.phone && <div className="flex items-center gap-1.5"><Phone className="size-3.5" /> {q.phone}</div>}
                    <div className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {q.pickupArea} → {q.workplaceAddress}</div>
                    <div className="flex items-center gap-1.5"><Users className="size-3.5" /> {q.numberOfEmployees} employees</div>
                    {q.preferredPlan && <div className="flex items-center gap-1.5"><FileText className="size-3.5" /> {q.preferredPlan}</div>}
                    {q.shift && <div className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {q.shift}</div>}
                  </div>
                  {q.company && <div className="text-sm text-muted-foreground mt-1">Company: {q.company}</div>}
                  {q.notes && <div className="text-sm text-muted-foreground mt-1 italic">Notes: {q.notes}</div>}
                  <div className="text-xs text-muted-foreground mt-2">
                    Submitted: {new Date(q._creationTime).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {q.status === "new" && (
                    <Button size="sm" variant="secondary" onClick={() => handleStatus(q._id, "reviewed")}>Mark Reviewed</Button>
                  )}
                  {(q.status === "new" || q.status === "reviewed") && (
                    <Button size="sm" onClick={() => handleStatus(q._id, "contacted")}>Contacted</Button>
                  )}
                  {q.status === "contacted" && (
                    <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => handleStatus(q._id, "converted")}>Converted</Button>
                  )}
                  {q.status !== "rejected" && q.status !== "converted" && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleStatus(q._id, "rejected")}>Reject</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!quotes || quotes.length === 0) && (
          <Card className="bg-card/50 border-border">
            <CardContent className="py-8 text-center text-muted-foreground">
              <FileText className="size-10 mx-auto mb-3 opacity-40" />
              <p>No quote requests yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
