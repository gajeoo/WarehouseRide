import { useAction, useMutation, useQuery } from "convex/react";
import { Loader2, Mail, Pencil, Plus, Search, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function AdminCustomersPage() {
  const customers = useQuery(api.customers.list);
  const routes = useQuery(api.routes.list);
  const vehicles = useQuery(api.vehicles.list);
  const activationTokens = useQuery(api.activation.listTokens);
  const adminUpdate = useMutation(api.customers.adminUpdate);
  const adminInvite = useAction(api.activation.adminInviteCustomer);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<Id<"customers"> | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editRoute, setEditRoute] = useState("");
  const [editVehicle, setEditVehicle] = useState("");
  const [saving, setSaving] = useState(false);

  // Add customer form
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPlan, setNewPlan] = useState("monthly");
  const [newWorkplace, setNewWorkplace] = useState("");
  const [newShift, setNewShift] = useState("");
  const [newRoute, setNewRoute] = useState("");
  const [inviting, setInviting] = useState(false);

  const filtered = customers?.filter((c) => {
    const s = search.toLowerCase();
    return !search || c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || (c.workplace || "").toLowerCase().includes(s);
  }) || [];

  const openEdit = (customer: NonNullable<typeof customers>[0]) => {
    setEditId(customer._id);
    setEditPlan(customer.plan || "none");
    setEditStatus(customer.status);
    setEditRoute(customer.routeId || "none");
    setEditVehicle(customer.vehicleId || "none");
  };

  const handleSave = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      await adminUpdate({
        customerId: editId,
        plan: editPlan === "none" ? undefined : editPlan as "monthly" | "biweekly" | "weekly" | "daily",
        status: editStatus as "active" | "inactive" | "suspended",
        routeId: editRoute === "none" ? undefined : editRoute as Id<"routes">,
        vehicleId: editVehicle === "none" ? undefined : editVehicle as Id<"vehicles">,
      });
      toast.success("Customer updated!");
      setEditId(null);
    } catch {
      toast.error("Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setInviting(true);
    try {
      const result = await adminInvite({
        name: newName.trim(),
        email: newEmail.trim(),
        role: "customer",
        plan: newPlan,
        workplace: newWorkplace.trim() || undefined,
        preferredShift: newShift || undefined,
        routeId: newRoute && newRoute !== "none" ? newRoute as Id<"routes"> : undefined,
      });
      if (result.success) {
        toast.success(result.message);
        setShowAddDialog(false);
        setNewName("");
        setNewEmail("");
        setNewPlan("monthly");
        setNewWorkplace("");
        setNewShift("");
        setNewRoute("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  const pendingInvitations = activationTokens?.filter((t) => !t.used && t.expiresAt > Date.now() && t.role === "customer") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">{customers?.length || 0} registered riders</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="size-4" />
          Add Customer
        </Button>
      </div>

      <Tabs defaultValue="customers">
        <TabsList>
          <TabsTrigger value="customers">All Customers</TabsTrigger>
          <TabsTrigger value="invitations">
            Pending Invitations
            {pendingInvitations.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">{pendingInvitations.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or workplace..."
              className="pl-10"
            />
          </div>

          <Card className="bg-card/80 border-border">
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Workplace</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c._id}>
                        <TableCell className="font-medium text-sm">{c.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {c.plan || "None"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs capitalize ${
                              c.status === "active" ? "bg-success/10 text-success border-success/20" :
                              c.status === "suspended" ? "bg-destructive/10 text-destructive border-destructive/20" :
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.preferredShift || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">{c.workplace || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                              <Pencil className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                          No customers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border">
            <CardContent className="pt-4">
              {pendingInvitations.length > 0 ? (
                <div className="space-y-3">
                  {pendingInvitations.map((t) => (
                    <div key={t._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="size-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          Expires {new Date(t.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="size-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium mb-1">No pending invitations</p>
                  <p className="text-sm">Add a customer to send them an activation link.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Plan</Label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Plan</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned Route</Label>
              <Select value={editRoute} onValueChange={setEditRoute}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Route</SelectItem>
                  {routes?.map((r) => (
                    <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned Vehicle</Label>
              <Select value={editVehicle} onValueChange={setEditVehicle}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Vehicle</SelectItem>
                  {vehicles?.map((v) => (
                    <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Customer / Send Activation Link dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlusIcon className="size-5 text-primary" />
              Add Customer
            </DialogTitle>
            <DialogDescription>
              Create a customer account and send them an activation email where they set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Marcus Johnson"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="marcus@email.com"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Plan</Label>
                <Select value={newPlan} onValueChange={setNewPlan}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="none">No Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Preferred Shift</Label>
                <Select value={newShift} onValueChange={setNewShift}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select shift" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning (4–8 AM)">Morning (4–8 AM)</SelectItem>
                    <SelectItem value="Day (8 AM–4 PM)">Day (8 AM–4 PM)</SelectItem>
                    <SelectItem value="Afternoon (2–6 PM)">Afternoon (2–6 PM)</SelectItem>
                    <SelectItem value="Night (6 PM–2 AM)">Night (6 PM–2 AM)</SelectItem>
                    <SelectItem value="Overnight (10 PM–6 AM)">Overnight (10 PM–6 AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Workplace</Label>
                <Input
                  value={newWorkplace}
                  onChange={(e) => setNewWorkplace(e.target.value)}
                  placeholder="Amazon BWI5"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Assign to Route</Label>
                <Select value={newRoute} onValueChange={setNewRoute}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="No route" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Route</SelectItem>
                    {routes?.map((r) => (
                      <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <Send className="size-4 text-primary" />
                <span className="font-medium">Activation email will be sent</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                The customer will receive an email with a secure link to set their password and activate their account. The link expires in 7 days.
              </p>
            </div>

            <Button onClick={handleInvite} disabled={inviting} className="w-full gap-2">
              {inviting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Add & Send Activation Email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Inline icon to avoid import issues
function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}
