import { useAction, useQuery } from "convex/react";
import { CreditCard, ExternalLink, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function InvoicesPage() {
  const invoices = useQuery(api.invoices.listMine);
  const profile = useQuery(api.customers.getMyProfile);
  const subscription = useQuery(api.stripe.getMySubscription);
  const createPortal = useAction(api.stripe.createPortalSession);
  const [portalLoading, setPortalLoading] = useState(false);

  const paid = invoices?.filter((i) => i.status === "paid").reduce((sum, inv) => sum + inv.amount, 0) || 0;
  const pending = invoices?.filter((i) => i.status === "pending").reduce((sum, inv) => sum + inv.amount, 0) || 0;

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const result = await createPortal();
      if (result.error) {
        toast.error(result.error);
      } else if (result.url) {
        window.open(result.url, "_blank");
      }
    } catch {
      toast.error("Unable to open billing portal. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices & Billing</h1>
        <p className="text-muted-foreground">Your payment history and subscription details.</p>
      </div>

      {/* Active Subscription Card */}
      {subscription && subscription.status === "active" && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="size-8 text-primary" />
                <div>
                  <div className="font-semibold capitalize">
                    {subscription.plan} Plan — Active
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Next billing: {formatDate(subscription.currentPeriodEnd)}
                    {subscription.cancelAtPeriodEnd && " (cancels at end of period)"}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageBilling}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Manage Billing
                    <ExternalLink className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs text-muted-foreground mb-1">Current Plan</div>
            <div className="text-xl font-bold capitalize">{profile?.plan || "None"}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs text-muted-foreground mb-1">Total Paid</div>
            <div className="text-xl font-bold text-success">${paid.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs text-muted-foreground mb-1">Outstanding</div>
            <div className="text-xl font-bold text-warning">${pending.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice table */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv._id}>
                    <TableCell className="text-sm">{inv.periodStart} – {inv.periodEnd}</TableCell>
                    <TableCell className="text-sm capitalize">{inv.plan}</TableCell>
                    <TableCell className="text-sm font-medium">${inv.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={inv.status === "paid" ? "default" : inv.status === "overdue" ? "destructive" : "secondary"}
                        className={`text-xs capitalize ${inv.status === "paid" ? "bg-success/10 text-success border-success/20" : ""}`}
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="size-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium mb-1">No invoices yet</p>
              <p className="text-sm">Your billing history will appear here once you have an active plan.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
