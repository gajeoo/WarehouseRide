import { useQuery } from "convex/react";
import { Bus, Clock, MapPin, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "../../convex/_generated/api";

export function TrackVanPage() {
  const profile = useQuery(api.customers.getMyProfile);
  const myRoute = useQuery(api.routes.getMyRoute);
  const vehicles = useQuery(api.vehicles.list);

  const myVehicle = vehicles?.find(
    (v) => profile?.vehicleId && v._id === profile.vehicleId
  ) || vehicles?.find(
    (v) => myRoute?.vehicleId && v._id === myRoute.vehicleId
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Track My Van</h1>
        <p className="text-muted-foreground">Real-time location of your assigned vehicle.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map area */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 border-border overflow-hidden">
            <div className="aspect-[16/10] bg-gradient-to-br from-[#0a1628] to-[#0f2440] relative flex items-center justify-center">
              {/* Simulated map with route */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" viewBox="0 0 800 500">
                  {/* Grid lines */}
                  {Array.from({ length: 20 }).map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={i * 25} x2="800" y2={i * 25} stroke="white" strokeWidth="0.3" opacity="0.15" />
                  ))}
                  {Array.from({ length: 32 }).map((_, i) => (
                    <line key={`v-${i}`} x1={i * 25} y1="0" x2={i * 25} y2="500" stroke="white" strokeWidth="0.3" opacity="0.15" />
                  ))}
                  {/* Route path */}
                  <path d="M 150 350 Q 250 300 350 250 Q 450 200 550 180 Q 620 170 650 150" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="8 4" />
                  {/* Stops */}
                  <circle cx="150" cy="350" r="8" fill="#22c55e" opacity="0.9" />
                  <circle cx="350" cy="250" r="6" fill="#f97316" opacity="0.9" />
                  <circle cx="550" cy="180" r="6" fill="#f97316" opacity="0.9" />
                  <circle cx="650" cy="150" r="8" fill="#ef4444" opacity="0.9" />
                  {/* Van position (animated) */}
                  <circle cx="420" cy="220" r="10" fill="#f97316" opacity="0.3">
                    <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="420" cy="220" r="6" fill="#f97316" />
                </svg>
              </div>

              {/* Labels */}
              <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <div className="size-2 rounded-full bg-success" />
                  <span>Start: {myRoute?.origin || "Baltimore"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-destructive" />
                  <span>End: {myRoute?.destination || "Warehouse"}</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2">
                <Navigation className="size-3.5 text-primary" />
                Live Tracking
              </div>
            </div>
          </Card>
        </div>

        {/* Van info sidebar */}
        <div className="space-y-4">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bus className="size-4 text-primary" />
                Vehicle Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myVehicle ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="text-sm font-medium">{myVehicle.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="text-sm font-medium capitalize">{myVehicle.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Capacity</span>
                    <span className="text-sm font-medium">{myVehicle.capacity} seats</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plate</span>
                    <span className="text-sm font-medium">{myVehicle.licensePlate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={myVehicle.status === "active" ? "default" : "secondary"} className="capitalize text-xs">
                      {myVehicle.status}
                    </Badge>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No vehicle assigned yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Route Stops
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myRoute?.stops && myRoute.stops.length > 0 ? (
                <div className="space-y-3">
                  {myRoute.stops.map((stop: { name: string; order: number }, i: number) => (
                    <div key={`stop-${stop.order}`} className="flex items-center gap-3">
                      <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? "bg-success text-success-foreground" :
                        i === myRoute.stops!.length - 1 ? "bg-destructive text-destructive-foreground" :
                        "bg-primary text-primary-foreground"
                      }`}>
                        {i + 1}
                      </div>
                      <span className="text-sm">{stop.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No stops available.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Departure</span>
                <span className="text-sm font-medium">{myRoute?.departureTime || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Return</span>
                <span className="text-sm font-medium">{myRoute?.returnTime || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Shift</span>
                <span className="text-sm font-medium capitalize">{myRoute?.shift || "—"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
