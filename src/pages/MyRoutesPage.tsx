import { useQuery } from "convex/react";
import { Clock, MapPin, Route } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "../../convex/_generated/api";

export function MyRoutesPage() {
  const myRoute = useQuery(api.routes.getMyRoute);
  const allRoutes = useQuery(api.routes.list);

  const activeRoutes = allRoutes?.filter((r) => r.status === "active") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Routes</h1>
        <p className="text-muted-foreground">Your assigned route and available alternatives.</p>
      </div>

      {/* Current route */}
      {myRoute ? (
        <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Route className="size-5 text-primary" />
                Your Active Route
              </CardTitle>
              <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg mb-2">{myRoute.name}</h3>
            {myRoute.description && (
              <p className="text-sm text-muted-foreground mb-4">{myRoute.description}</p>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-success" />
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-medium">{myRoute.origin}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-destructive" />
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-medium">{myRoute.destination}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-primary" />
                  <span className="text-muted-foreground">Depart:</span>
                  <span className="font-medium">{myRoute.departureTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-info" />
                  <span className="text-muted-foreground">Return:</span>
                  <span className="font-medium">{myRoute.returnTime}</span>
                </div>
              </div>
            </div>
            {myRoute.stops && myRoute.stops.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium mb-2">Stops</p>
                <div className="flex flex-wrap gap-2">
                  {myRoute.stops.map((stop: { name: string; order: number }) => (
                    <Badge key={`stop-${stop.order}`} variant="secondary" className="text-xs">
                      {stop.order}. {stop.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/50 border-border">
          <CardContent className="py-8 text-center">
            <Route className="size-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium mb-1">No Route Assigned</p>
            <p className="text-sm text-muted-foreground">Contact admin to get assigned to a route.</p>
          </CardContent>
        </Card>
      )}

      {/* Available routes */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Available Routes</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {activeRoutes.map((route) => (
            <Card
              key={route._id}
              className={`bg-card/50 border-border ${myRoute?._id === route._id ? "ring-1 ring-primary/30" : ""}`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{route.name}</h3>
                  {myRoute?._id === route._id && (
                    <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Your Route</Badge>
                  )}
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3" /> {route.origin} → {route.destination}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3" /> {route.departureTime} – {route.returnTime}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Route className="size-3" /> {route.serviceArea} • {route.shift} shift
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {activeRoutes.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-2">No routes available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
