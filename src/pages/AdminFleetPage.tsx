import { useMutation, useQuery } from "convex/react";
import { Bus, MapPin, Pencil, Plus, Route, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function AdminFleetPage() {
  const vehicles = useQuery(api.vehicles.list);
  const routes = useQuery(api.routes.list);
  const createVehicle = useMutation(api.vehicles.create);
  const updateVehicle = useMutation(api.vehicles.update);
  const removeVehicle = useMutation(api.vehicles.remove);
  const createRoute = useMutation(api.routes.create);
  const updateRoute = useMutation(api.routes.update);
  const removeRoute = useMutation(api.routes.remove);

  // Vehicle dialog state
  const [vehicleDialog, setVehicleDialog] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState<Id<"vehicles"> | null>(null);
  const [vName, setVName] = useState("");
  const [vType, setVType] = useState("van");
  const [vCapacity, setVCapacity] = useState(15);
  const [vPlate, setVPlate] = useState("");
  const [vStatus, setVStatus] = useState("active");

  // Route dialog state
  const [routeDialog, setRouteDialog] = useState(false);
  const [editRouteId, setEditRouteId] = useState<Id<"routes"> | null>(null);
  const [rName, setRName] = useState("");
  const [rOrigin, setROrigin] = useState("");
  const [rDest, setRDest] = useState("");
  const [rDepart, setRDepart] = useState("");
  const [rReturn, setRReturn] = useState("");
  const [rShift, setRShift] = useState("morning");
  const [rArea, setRArea] = useState("");
  const [rVehicle, setRVehicle] = useState("");
  const [rStatus, setRStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  const openNewVehicle = () => {
    setEditVehicleId(null);
    setVName(""); setVType("van"); setVCapacity(15); setVPlate(""); setVStatus("active");
    setVehicleDialog(true);
  };

  const openEditVehicle = (v: NonNullable<typeof vehicles>[0]) => {
    setEditVehicleId(v._id);
    setVName(v.name); setVType(v.type); setVCapacity(v.capacity); setVPlate(v.licensePlate); setVStatus(v.status);
    setVehicleDialog(true);
  };

  const saveVehicle = async () => {
    setSaving(true);
    try {
      const data = { name: vName, type: vType as "van" | "minibus" | "shuttle", capacity: vCapacity, licensePlate: vPlate, status: vStatus as "active" | "maintenance" | "inactive" };
      if (editVehicleId) {
        await updateVehicle({ id: editVehicleId, ...data });
        toast.success("Vehicle updated!");
      } else {
        await createVehicle(data);
        toast.success("Vehicle created!");
      }
      setVehicleDialog(false);
    } catch { toast.error("Failed to save vehicle."); }
    finally { setSaving(false); }
  };

  const openNewRoute = () => {
    setEditRouteId(null);
    setRName(""); setROrigin(""); setRDest(""); setRDepart(""); setRReturn(""); setRShift("morning"); setRArea(""); setRVehicle(""); setRStatus("active");
    setRouteDialog(true);
  };

  const openEditRoute = (r: NonNullable<typeof routes>[0]) => {
    setEditRouteId(r._id);
    setRName(r.name); setROrigin(r.origin); setRDest(r.destination);
    setRDepart(r.departureTime); setRReturn(r.returnTime); setRShift(r.shift);
    setRArea(r.serviceArea); setRVehicle(r.vehicleId || ""); setRStatus(r.status);
    setRouteDialog(true);
  };

  const saveRoute = async () => {
    setSaving(true);
    try {
      const data = {
        name: rName, origin: rOrigin, destination: rDest,
        departureTime: rDepart, returnTime: rReturn,
        shift: rShift as "morning" | "afternoon" | "night" | "overnight",
        serviceArea: rArea,
        vehicleId: rVehicle ? (rVehicle as Id<"vehicles">) : undefined,
        status: rStatus as "active" | "inactive",
      };
      if (editRouteId) {
        await updateRoute({ id: editRouteId, ...data });
        toast.success("Route updated!");
      } else {
        await createRoute(data);
        toast.success("Route created!");
      }
      setRouteDialog(false);
    } catch { toast.error("Failed to save route."); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fleet & Routes</h1>
        <p className="text-muted-foreground">Manage vehicles and transportation routes.</p>
      </div>

      <Tabs defaultValue="vehicles">
        <TabsList>
          <TabsTrigger value="vehicles">
            <Bus className="size-4 mr-1.5" /> Vehicles ({vehicles?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="routes">
            <Route className="size-4 mr-1.5" /> Routes ({routes?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={openNewVehicle}><Plus className="size-4" /> Add Vehicle</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {vehicles?.map((v) => (
              <Card key={v._id} className="bg-card/50 border-border">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bus className="size-5 text-primary" />
                      <h3 className="font-semibold">{v.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditVehicle(v)}><Pencil className="size-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { removeVehicle({ id: v._id }); toast.success("Vehicle removed."); }}><Trash2 className="size-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Type: <span className="text-foreground capitalize">{v.type}</span></div>
                    <div>Capacity: <span className="text-foreground">{v.capacity} seats</span></div>
                    <div>Plate: <span className="text-foreground">{v.licensePlate}</span></div>
                  </div>
                  <Badge className={`mt-3 text-xs capitalize ${
                    v.status === "active" ? "bg-success/10 text-success border-success/20" :
                    v.status === "maintenance" ? "bg-warning/10 text-warning border-warning/20" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {v.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {(!vehicles || vehicles.length === 0) && (
              <p className="text-muted-foreground text-sm col-span-2">No vehicles registered yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="routes" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={openNewRoute}><Plus className="size-4" /> Add Route</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {routes?.map((r) => (
              <Card key={r._id} className="bg-card/50 border-border">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Route className="size-5 text-primary" />
                      <h3 className="font-semibold">{r.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditRoute(r)}><Pencil className="size-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { removeRoute({ id: r._id }); toast.success("Route removed."); }}><Trash2 className="size-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3" /> {r.origin} → {r.destination}
                    </div>
                    <div>Departure: <span className="text-foreground">{r.departureTime}</span> | Return: <span className="text-foreground">{r.returnTime}</span></div>
                    <div>Shift: <span className="text-foreground capitalize">{r.shift}</span> | Area: <span className="text-foreground">{r.serviceArea}</span></div>
                  </div>
                  <Badge className={`mt-3 text-xs capitalize ${r.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}`}>
                    {r.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {(!routes || routes.length === 0) && (
              <p className="text-muted-foreground text-sm col-span-2">No routes created yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Vehicle dialog */}
      <Dialog open={vehicleDialog} onOpenChange={setVehicleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editVehicleId ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Name</Label><Input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="Van Alpha" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label>
                <Select value={vType} onValueChange={setVType}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="van">Van</SelectItem><SelectItem value="minibus">Minibus</SelectItem><SelectItem value="shuttle">Shuttle</SelectItem>
                </SelectContent></Select>
              </div>
              <div><Label>Capacity</Label><Input type="number" value={vCapacity} onChange={(e) => setVCapacity(Number(e.target.value))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>License Plate</Label><Input value={vPlate} onChange={(e) => setVPlate(e.target.value)} className="mt-1" /></div>
              <div><Label>Status</Label>
                <Select value={vStatus} onValueChange={setVStatus}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="active">Active</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent></Select>
              </div>
            </div>
            <Button onClick={saveVehicle} disabled={saving} className="w-full">{saving ? "Saving..." : "Save Vehicle"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Route dialog */}
      <Dialog open={routeDialog} onOpenChange={setRouteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRouteId ? "Edit Route" : "Add Route"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Route Name</Label><Input value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Baltimore Morning Express" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Origin</Label><Input value={rOrigin} onChange={(e) => setROrigin(e.target.value)} placeholder="Baltimore" className="mt-1" /></div>
              <div><Label>Destination</Label><Input value={rDest} onChange={(e) => setRDest(e.target.value)} placeholder="Jessup Warehouse Hub" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Departure Time</Label><Input value={rDepart} onChange={(e) => setRDepart(e.target.value)} placeholder="5:30 AM" className="mt-1" /></div>
              <div><Label>Return Time</Label><Input value={rReturn} onChange={(e) => setRReturn(e.target.value)} placeholder="4:00 PM" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Shift</Label>
                <Select value={rShift} onValueChange={setRShift}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="morning">Morning</SelectItem><SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="night">Night</SelectItem><SelectItem value="overnight">Overnight</SelectItem>
                </SelectContent></Select>
              </div>
              <div><Label>Service Area</Label><Input value={rArea} onChange={(e) => setRArea(e.target.value)} placeholder="Baltimore" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Vehicle</Label>
                <Select value={rVehicle} onValueChange={setRVehicle}><SelectTrigger className="mt-1"><SelectValue placeholder="Assign vehicle" /></SelectTrigger><SelectContent>
                  {vehicles?.map((v) => <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>)}
                </SelectContent></Select>
              </div>
              <div><Label>Status</Label>
                <Select value={rStatus} onValueChange={setRStatus}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent></Select>
              </div>
            </div>
            <Button onClick={saveRoute} disabled={saving} className="w-full">{saving ? "Saving..." : "Save Route"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
