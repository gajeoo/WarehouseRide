import { useMutation, useQuery } from "convex/react";
import { Bus, Calendar, Clock, MapPin, Route } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";

export function DashboardPage() {
  const profile = useQuery(api.customers.getMyProfile);
  const myRoute = useQuery(api.routes.getMyRoute);
  const invoices = useQuery(api.invoices.listMine);
  const ensureProfile = useMutation(api.customers.ensureCustomerProfile);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile === null) {
      ensureProfile();
    }
  }, [profile, ensureProfile]);

  // Redirect drivers to their dedicated portal
  useEffect(() => {
    if (profile?.role === "driver") {
      navigate("/driver", { replace: true });
    }
  }, [profile?.role, navigate]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{greeting}{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!</h1>
        <p className="text-muted-foreground">Here's your ride overview for today.</p>
      </div>

      {/* Quick stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bus className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Plan</div>
                <div className="font-semibold capitalize">{profile?.plan || "None"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="size-5 text-info" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Shift</div>
                <div className="font-semibold">{profile?.preferredShift || "Not set"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Route className="size-5 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Route</div>
                <div className="font-semibold text-sm truncate max-w-[140px]">{myRoute?.name || "Not assigned"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Calendar className="size-5 text-warning" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Invoices</div>
                <div className="font-semibold">{invoices?.length || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's schedule */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {myRoute ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-success" />
                  <div>
                    <div className="font-medium text-sm">Pickup</div>
                    <div className="text-xs text-muted-foreground">{myRoute.departureTime} • {myRoute.origin}</div>
                  </div>
                </div>
                <MapPin className="size-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-primary" />
                  <div>
                    <div className="font-medium text-sm">Arrival at Work</div>
                    <div className="text-xs text-muted-foreground">{myRoute.destination}</div>
                  </div>
                </div>
                <MapPin className="size-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-info" />
                  <div>
                    <div className="font-medium text-sm">Return Home</div>
                    <div className="text-xs text-muted-foreground">{myRoute.returnTime}</div>
                  </div>
                </div>
                <MapPin className="size-4 text-muted-foreground" />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bus className="size-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium mb-1">No route assigned yet</p>
              <p className="text-sm mb-4">Contact admin to get assigned to a route.</p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings">Update Your Profile</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Button variant="outline" asChild className="h-auto py-4 bg-accent">
          <Link to="/track" className="flex flex-col items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <span className="text-sm font-medium">Track My Van</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-4 bg-accent">
          <Link to="/routes" className="flex flex-col items-center gap-2">
            <Route className="size-5 text-info" />
            <span className="text-sm font-medium">View Routes</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-4 bg-accent">
          <Link to="/invoices" className="flex flex-col items-center gap-2">
            <Calendar className="size-5 text-success" />
            <span className="text-sm font-medium">View Invoices</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
