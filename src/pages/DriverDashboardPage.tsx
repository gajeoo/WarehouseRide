import { useMutation, useQuery } from "convex/react";
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Route,
  Users,
  Mail,
  Building2,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";

export function DriverDashboardPage() {
  const profile = useQuery(api.customers.getMyProfile);
  const assignments = useQuery(api.customers.getDriverAssignments);
  const riders = useQuery(api.customers.getMyRiders);
  const ensureProfile = useMutation(api.customers.ensureCustomerProfile);
  const updateLocation = useMutation(api.vehicles.updateDriverLocation);
  const [sharingLocation, setSharingLocation] = useState(false);

  useEffect(() => {
    if (profile === null) {
      ensureProfile();
    }
  }, [profile, ensureProfile]);

  // Auto-share location
  useEffect(() => {
    if (!sharingLocation || profile?.role !== "driver") return;
    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          updateLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [sharingLocation, profile?.role, updateLocation]);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}
            {profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-muted-foreground">
            Your driver dashboard — routes, riders & pickups.
          </p>
        </div>
        <Button
          variant={sharingLocation ? "default" : "outline"}
          size="sm"
          onClick={() => setSharingLocation(!sharingLocation)}
          className="gap-2"
        >
          <Navigation className={`size-4 ${sharingLocation ? "animate-pulse" : ""}`} />
          {sharingLocation ? "Sharing Location" : "Start Sharing Location"}
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">My Riders</div>
                <div className="font-semibold">
                  {assignments?.totalRiders || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Route className="size-5 text-info" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">My Routes</div>
                <div className="font-semibold">
                  {assignments?.routes?.length || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Bus className="size-5 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">My Vehicles</div>
                <div className="font-semibold">
                  {assignments?.vehicles?.length || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Navigation
                  className={`size-5 text-warning ${sharingLocation ? "animate-pulse" : ""}`}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Location</div>
                <div className="font-semibold text-sm">
                  {sharingLocation ? "Live" : "Off"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Routes */}
      {assignments?.routes && assignments.routes.length > 0 && (
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Route className="size-5 text-primary" />
              Assigned Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {assignments.routes.map(
                (route: {
                  _id: string;
                  name: string;
                  origin: string;
                  destination: string;
                  departureTime: string;
                  returnTime: string;
                  shift: string;
                  riderCount: number;
                  stops?: { name: string; order: number }[];
                }) => (
                  <div
                    key={route._id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{route.name}</h4>
                      <Badge variant="outline" className="capitalize">
                        {route.shift}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-3.5" />
                        <span>
                          {route.origin} → {route.destination}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span>
                          Depart: {route.departureTime} • Return:{" "}
                          {route.returnTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="size-3.5" />
                        <span>{route.riderCount} riders on this route</span>
                      </div>
                    </div>
                    {route.stops && route.stops.length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Pickup Stops:
                        </p>
                        <div className="space-y-1">
                          {route.stops
                            .sort((a, b) => a.order - b.order)
                            .map((stop, i) => (
                              <div
                                key={`stop-${stop.order}`}
                                className="flex items-center gap-2 text-sm"
                              >
                                <div
                                  className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    i === 0
                                      ? "bg-success text-success-foreground"
                                      : i === route.stops!.length - 1
                                        ? "bg-destructive text-destructive-foreground"
                                        : "bg-primary text-primary-foreground"
                                  }`}
                                >
                                  {i + 1}
                                </div>
                                <span>{stop.name}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Vehicles */}
      {assignments?.vehicles && assignments.vehicles.length > 0 && (
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bus className="size-5 text-primary" />
              Assigned Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.vehicles.map(
                (vehicle: {
                  _id: string;
                  name: string;
                  type: string;
                  capacity: number;
                  licensePlate: string;
                  status: string;
                }) => (
                  <div
                    key={vehicle._id}
                    className="border border-border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{vehicle.name}</h4>
                      <Badge
                        variant={
                          vehicle.status === "active" ? "default" : "secondary"
                        }
                        className="capitalize text-xs"
                      >
                        {vehicle.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        Type: <span className="capitalize">{vehicle.type}</span>
                      </p>
                      <p>Capacity: {vehicle.capacity} seats</p>
                      <p>Plate: {vehicle.licensePlate}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Riders - Pickup Locations */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Riders & Pickup Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {riders && riders.length > 0 ? (
            <div className="space-y-3">
              {riders.map(
                (rider: {
                  _id: string;
                  name: string;
                  email: string;
                  phone?: string;
                  address?: string;
                  city?: string;
                  workplace?: string;
                  workplaceAddress?: string;
                  preferredShift?: string;
                  customShiftTime?: string;
                  workSchedule?: string[];
                  routeName: string;
                  departureTime: string;
                  plan: string;
                  status: string;
                }) => (
                  <div
                    key={rider._id}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{rider.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Route: {rider.routeName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize text-xs">
                          {rider.plan}
                        </Badge>
                        <Badge
                          variant={
                            rider.status === "active" ? "default" : "secondary"
                          }
                          className="capitalize text-xs"
                        >
                          {rider.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {rider.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="size-3.5 mt-0.5 text-primary shrink-0" />
                          <span>
                            Pickup: {rider.address}
                            {rider.city ? `, ${rider.city}` : ""}
                          </span>
                        </div>
                      )}
                      {rider.workplace && (
                        <div className="flex items-start gap-2">
                          <Building2 className="size-3.5 mt-0.5 text-primary shrink-0" />
                          <span>
                            Work: {rider.workplace}
                            {rider.workplaceAddress
                              ? ` (${rider.workplaceAddress})`
                              : ""}
                          </span>
                        </div>
                      )}
                      {rider.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="size-3.5 text-primary shrink-0" />
                          <span>{rider.phone}</span>
                        </div>
                      )}
                      {rider.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="size-3.5 text-primary shrink-0" />
                          <span>{rider.email}</span>
                        </div>
                      )}
                      {rider.preferredShift && (
                        <div className="flex items-center gap-2">
                          <Clock className="size-3.5 text-primary shrink-0" />
                          <span>
                            Shift: {rider.preferredShift}
                            {rider.customShiftTime
                              ? ` (${rider.customShiftTime})`
                              : ""}
                          </span>
                        </div>
                      )}
                      {rider.workSchedule && rider.workSchedule.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5 text-primary shrink-0" />
                          <span>
                            Days: {rider.workSchedule.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="size-8 mx-auto mb-2 opacity-50" />
              <p>No riders assigned to your routes yet.</p>
              <p className="text-sm">
                Your admin will assign riders to your routes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
