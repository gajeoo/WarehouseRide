import { useAction, useMutation, useQuery } from "convex/react";
import {
  Bus,
  Car,
  Check,
  Loader2,
  MapPin,
  MoreVertical,
  Route,
  Search,
  Send,
  Shield,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const ALL_DRIVER_FEATURES = [
  { id: "view_riders", label: "View Riders", description: "See assigned riders and their info" },
  { id: "view_pickup_locations", label: "View Pickup Locations", description: "See rider pickup addresses" },
  { id: "view_routes", label: "View Routes", description: "See assigned routes and stops" },
  { id: "view_schedule", label: "View Schedule", description: "See departure/return times" },
  { id: "share_location", label: "Share Location", description: "Share real-time GPS location" },
  { id: "contact_riders", label: "Contact Riders", description: "See rider phone/email" },
  { id: "view_vehicles", label: "View Vehicles", description: "See assigned vehicle details" },
];

export function AdminDriversPage() {
  const drivers = useQuery(api.customers.listDrivers);
  const routes = useQuery(api.routes.list);
  const vehicles = useQuery(api.vehicles.list);
  const driverStats = useQuery(api.customers.driverStats);
  const adminInvite = useAction(api.activation.adminInviteCustomer);
  const removeCustomer = useMutation(api.customers.remove);
  const updateFeatures = useMutation(api.customers.updateDriverFeatures);
  const assignToRoute = useMutation(api.customers.assignDriverToRoute);
  const assignToVehicle = useMutation(api.customers.assignDriverToVehicle);
  const toggleLocSharing = useMutation(api.vehicles.toggleLocationSharing);

  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFeaturesDialog, setShowFeaturesDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<{
    _id: Id<"customers">;
    name: string;
    allowedFeatures?: string[];
  } | null>(null);

  // Add driver form
  const [driverName, setDriverName] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [driverShift, setDriverShift] = useState("");
  const [inviting, setInviting] = useState(false);

  // Assign form
  const [assignRouteId, setAssignRouteId] = useState("");
  const [assignVehicleId, setAssignVehicleId] = useState("");

  // Feature checkboxes
  const [checkedFeatures, setCheckedFeatures] = useState<string[]>([]);

  const filteredDrivers = drivers?.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleInviteDriver = async () => {
    if (!driverName || !driverEmail) return;
    setInviting(true);
    try {
      const result = await adminInvite({
        name: driverName,
        email: driverEmail,
        role: "driver",
        preferredShift: driverShift || undefined,
      });
      if (result.success) {
        toast.success(result.message);
        setShowAddDialog(false);
        setDriverName("");
        setDriverEmail("");
        setDriverShift("");
      } else {
        toast.error(result.message);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to invite driver");
    } finally {
      setInviting(false);
    }
  };

  const handleSaveFeatures = async () => {
    if (!selectedDriver) return;
    try {
      await updateFeatures({
        customerId: selectedDriver._id,
        allowedFeatures: checkedFeatures,
      });
      toast.success("Features updated");
      setShowFeaturesDialog(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to update features");
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) return;
    try {
      if (assignRouteId) {
        await assignToRoute({
          routeId: assignRouteId as Id<"routes">,
          driverId: selectedDriver._id,
        });
      }
      if (assignVehicleId) {
        await assignToVehicle({
          vehicleId: assignVehicleId as Id<"vehicles">,
          driverId: selectedDriver._id,
        });
      }
      toast.success("Driver assigned");
      setShowAssignDialog(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to assign driver");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-muted-foreground">
            Manage drivers, assign routes & features.
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <UserPlus className="size-4" />
          Add Driver
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Drivers</div>
                <div className="text-2xl font-bold">{driverStats?.total || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Check className="size-5 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Active</div>
                <div className="text-2xl font-bold">{driverStats?.active || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Bus className="size-5 text-info" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Vehicles</div>
                <div className="text-2xl font-bold">
                  {vehicles?.filter((v) => v.status === "active").length || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Sharing Controls */}
      {vehicles && vehicles.length > 0 && (
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Van Location Sharing — Control what riders can see
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="flex items-center justify-between border border-border rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Bus className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{vehicle.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {vehicle.licensePlate} • {vehicle.capacity} seats
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {vehicle.shareLocationWithRiders
                        ? "Sharing with riders"
                        : "Hidden from riders"}
                    </span>
                    <Switch
                      checked={vehicle.shareLocationWithRiders === true}
                      onCheckedChange={(checked) =>
                        toggleLocSharing({
                          vehicleId: vehicle._id,
                          shareLocationWithRiders: checked,
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search drivers..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Drivers Table */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Features</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers && filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => (
                  <TableRow key={driver._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-xs text-muted-foreground">{driver.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={driver.status === "active" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {driver.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {driver.preferredShift || "—"}
                    </TableCell>
                    <TableCell>
                      {driver.allowedFeatures && driver.allowedFeatures.length > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {driver.allowedFeatures.length} features
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">All access</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedDriver(driver);
                              setCheckedFeatures(driver.allowedFeatures || ALL_DRIVER_FEATURES.map((f) => f.id));
                              setShowFeaturesDialog(true);
                            }}
                          >
                            <Shield className="size-4 mr-2" />
                            Manage Features
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedDriver(driver);
                              setAssignRouteId("");
                              setAssignVehicleId("");
                              setShowAssignDialog(true);
                            }}
                          >
                            <Route className="size-4 mr-2" />
                            Assign Route / Vehicle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => {
                              if (confirm(`Remove ${driver.name}?`)) {
                                await removeCustomer({ customerId: driver._id });
                                toast.success("Driver removed");
                              }
                            }}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Remove Driver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {drivers === undefined ? (
                      <Loader2 className="size-5 animate-spin mx-auto" />
                    ) : (
                      "No drivers yet. Click 'Add Driver' to invite one."
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Driver Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>
              Send an activation link to a new driver. They'll set their password
              and get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={driverEmail}
                onChange={(e) => setDriverEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Shift</Label>
              <Select value={driverShift} onValueChange={setDriverShift}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full gap-2"
              onClick={handleInviteDriver}
              disabled={inviting || !driverName || !driverEmail}
            >
              {inviting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send Activation Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Features Dialog */}
      <Dialog open={showFeaturesDialog} onOpenChange={setShowFeaturesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Manage Features — {selectedDriver?.name}
            </DialogTitle>
            <DialogDescription>
              Choose what this driver can see and do.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {ALL_DRIVER_FEATURES.map((feature) => (
              <div
                key={feature.id}
                className="flex items-start gap-3 p-3 border border-border rounded-lg"
              >
                <Checkbox
                  id={feature.id}
                  checked={checkedFeatures.includes(feature.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCheckedFeatures([...checkedFeatures, feature.id]);
                    } else {
                      setCheckedFeatures(
                        checkedFeatures.filter((f) => f !== feature.id)
                      );
                    }
                  }}
                />
                <div>
                  <label
                    htmlFor={feature.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {feature.label}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
            <Button className="w-full" onClick={handleSaveFeatures}>
              Save Features
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Route/Vehicle Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign Route / Vehicle — {selectedDriver?.name}
            </DialogTitle>
            <DialogDescription>
              Assign this driver to a route and/or vehicle.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Route</Label>
              <Select value={assignRouteId} onValueChange={setAssignRouteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes
                    ?.filter((r) => r.status === "active")
                    .map((route) => (
                      <SelectItem key={route._id} value={route._id}>
                        {route.name} ({route.origin} → {route.destination})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vehicle</Label>
              <Select
                value={assignVehicleId}
                onValueChange={setAssignVehicleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles
                    ?.filter((v) => v.status === "active")
                    .map((vehicle) => (
                      <SelectItem key={vehicle._id} value={vehicle._id}>
                        {vehicle.name} ({vehicle.licensePlate})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleAssignDriver}
              disabled={!assignRouteId && !assignVehicleId}
            >
              Assign Driver
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
