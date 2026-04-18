import { useQuery } from "convex/react";
import { Bus, DollarSign, FileText, Route, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";

export function AdminDashboardPage() {
  const customerStats = useQuery(api.customers.stats);
  const quoteStats = useQuery(api.quotes.stats);
  const vehicles = useQuery(api.vehicles.list);
  const routes = useQuery(api.routes.list);
  const invoices = useQuery(api.invoices.listAll);

  const activeVehicles = vehicles?.filter((v) => v.status === "active").length || 0;
  const activeRoutes = routes?.filter((r) => r.status === "active").length || 0;
  const totalRevenue = invoices?.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0) || 0;
  const pendingRevenue = invoices?.filter((i) => i.status === "pending").reduce((sum, i) => sum + i.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of WarehouseRide operations.</p>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Total Riders</div>
                <div className="text-2xl font-bold">{customerStats?.total || 0}</div>
                <div className="text-xs text-success">{customerStats?.active || 0} active</div>
              </div>
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Revenue (Paid)</div>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <div className="text-xs text-warning">${pendingRevenue.toLocaleString()} pending</div>
              </div>
              <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="size-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Active Routes</div>
                <div className="text-2xl font-bold">{activeRoutes}</div>
                <div className="text-xs text-muted-foreground">{activeVehicles} vehicles active</div>
              </div>
              <div className="size-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Route className="size-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Quote Requests</div>
                <div className="text-2xl font-bold">{quoteStats?.total || 0}</div>
                <div className="text-xs text-warning">{quoteStats?.new || 0} new</div>
              </div>
              <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <FileText className="size-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Plan Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Monthly", count: customerStats?.monthly || 0, color: "bg-primary" },
                { label: "Bi-weekly", count: customerStats?.biweekly || 0, color: "bg-info" },
                { label: "Weekly", count: customerStats?.weekly || 0, color: "bg-success" },
                { label: "Daily", count: customerStats?.daily || 0, color: "bg-warning" },
              ].map((plan) => {
                const total = customerStats?.total || 1;
                const pct = total > 0 ? Math.round((plan.count / total) * 100) : 0;
                return (
                  <div key={plan.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{plan.label}</span>
                      <span className="text-muted-foreground">{plan.count} riders ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full rounded-full ${plan.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bus className="size-5 text-primary" />
              Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehicles?.map((v) => (
                <div key={v._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <div className="font-medium text-sm">{v.name}</div>
                    <div className="text-xs text-muted-foreground">{v.licensePlate} • {v.capacity} seats</div>
                  </div>
                  <div className={`size-2.5 rounded-full ${
                    v.status === "active" ? "bg-success" :
                    v.status === "maintenance" ? "bg-warning" : "bg-muted-foreground"
                  }`} />
                </div>
              ))}
              {(!vehicles || vehicles.length === 0) && (
                <p className="text-sm text-muted-foreground">No vehicles registered.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
