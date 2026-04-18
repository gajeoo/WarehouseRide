import { useAction, useMutation, useQuery } from "convex/react";
import {
  Building2,
  Loader2,
  Mail,
  MoreVertical,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function AdminEmployeesPage() {
  const employees = useQuery(api.customers.listMyEmployees);
  const routes = useQuery(api.routes.list);
  const activationTokens = useQuery(api.activation.listTokens);
  const profile = useQuery(api.customers.getMyProfile);
  const adminInvite = useAction(api.activation.adminInviteCustomer);
  const removeCustomer = useMutation(api.customers.remove);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showManagerDialog, setShowManagerDialog] = useState(false);

  // Add employee form
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empWorkplace, setEmpWorkplace] = useState("");
  const [empShift, setEmpShift] = useState("");
  const [empRoute, setEmpRoute] = useState("");
  const [inviting, setInviting] = useState(false);

  // Add manager form
  const [mgrName, setMgrName] = useState("");
  const [mgrEmail, setMgrEmail] = useState("");
  const [mgrWarehouse, setMgrWarehouse] = useState("");
  const [mgrInviting, setMgrInviting] = useState(false);

  const filtered = employees?.filter((e) => {
    const s = search.toLowerCase();
    return !search || e.name.toLowerCase().includes(s) || e.email.toLowerCase().includes(s) || (e.workplace || "").toLowerCase().includes(s);
  }) || [];

  const pendingEmployeeTokens = activationTokens?.filter(
    (t) => !t.used && t.expiresAt > Date.now() && (t.role === "employee" || t.role === "warehouse_manager")
  ) || [];

  const handleAddEmployee = async () => {
    if (!empName.trim() || !empEmail.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setInviting(true);
    try {
      const result = await adminInvite({
        name: empName.trim(),
        email: empEmail.trim(),
        role: "employee",
        workplace: empWorkplace.trim() || undefined,
        preferredShift: empShift || undefined,
        routeId: empRoute && empRoute !== "none" ? empRoute as Id<"routes"> : undefined,
        managedBy: profile?._id,
      });
      if (result.success) {
        toast.success(result.message);
        setShowAddDialog(false);
        setEmpName("");
        setEmpEmail("");
        setEmpWorkplace("");
        setEmpShift("");
        setEmpRoute("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  const handleAddManager = async () => {
    if (!mgrName.trim() || !mgrEmail.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setMgrInviting(true);
    try {
      const result = await adminInvite({
        name: mgrName.trim(),
        email: mgrEmail.trim(),
        role: "warehouse_manager",
        warehouseName: mgrWarehouse.trim() || undefined,
      });
      if (result.success) {
        toast.success(result.message);
        setShowManagerDialog(false);
        setMgrName("");
        setMgrEmail("");
        setMgrWarehouse("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to send invitation.");
    } finally {
      setMgrInviting(false);
    }
  };

  const handleRemoveEmployee = async (id: Id<"customers">) => {
    try {
      await removeCustomer({ customerId: id });
      toast.success("Employee removed.");
    } catch {
      toast.error("Failed to remove employee.");
    }
  };

  const stats = {
    total: employees?.length || 0,
    active: employees?.filter((e) => e.status === "active").length || 0,
    pending: employees?.filter((e) => e.status === "pending").length || 0,
    pendingInvites: pendingEmployeeTokens.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Employees & Managers</h1>
          <p className="text-muted-foreground">Manage warehouse employees and send account activation links</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowManagerDialog(true)} className="gap-2">
            <Building2 className="size-4" />
            Add Manager
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <UserPlus className="size-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/80 border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Active</p>
                <p className="text-2xl font-bold mt-1">{stats.active}</p>
              </div>
              <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="size-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p>
                <p className="text-2xl font-bold mt-1">{stats.pending}</p>
              </div>
              <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Users className="size-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Invitations</p>
                <p className="text-2xl font-bold mt-1">{stats.pendingInvites}</p>
              </div>
              <div className="size-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Send className="size-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="invitations">
            Pending Invitations
            {pendingEmployeeTokens.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">{pendingEmployeeTokens.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
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
                      <TableHead>Status</TableHead>
                      <TableHead>Workplace</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead className="w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((emp) => (
                      <TableRow key={emp._id}>
                        <TableCell className="font-medium text-sm">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                            {emp.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{emp.email}</TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs capitalize ${
                              emp.status === "active" ? "bg-success/10 text-success border-success/20" :
                              emp.status === "suspended" ? "bg-destructive/10 text-destructive border-destructive/20" :
                              "bg-warning/10 text-warning border-warning/20"
                            }`}
                          >
                            {emp.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{emp.workplace || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{emp.preferredShift || "—"}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleRemoveEmployee(emp._id)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="size-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                          <Users className="size-10 mx-auto mb-3 opacity-30" />
                          <p className="font-medium mb-1">No employees yet</p>
                          <p className="text-xs">Add employees and send them activation links to get started.</p>
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
              {pendingEmployeeTokens.length > 0 ? (
                <div className="space-y-3">
                  {pendingEmployeeTokens.map((t) => (
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
                        <Badge variant="outline" className="text-xs capitalize">
                          {t.role === "warehouse_manager" ? "Manager" : "Employee"}
                        </Badge>
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
                  <p className="text-sm">Use the "Add Employee" button to send activation links.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-primary" />
              Add Employee
            </DialogTitle>
            <DialogDescription>
              Send an activation link for the employee to set their password and join WarehouseRide.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="James Smith"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input
                  type="email"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  placeholder="james@email.com"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Workplace</Label>
                <Input
                  value={empWorkplace}
                  onChange={(e) => setEmpWorkplace(e.target.value)}
                  placeholder="Amazon BWI5"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Preferred Shift</Label>
                <Select value={empShift} onValueChange={setEmpShift}>
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
            <div>
              <Label>Assign to Route</Label>
              <Select value={empRoute} onValueChange={setEmpRoute}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="No route assigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Route</SelectItem>
                  {routes?.map((r) => (
                    <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <Send className="size-4 text-primary" />
                <span className="font-medium">Activation email will be sent</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                They'll receive a secure link to set their password and create their account. Expires in 7 days.
              </p>
            </div>

            <Button onClick={handleAddEmployee} disabled={inviting} className="w-full gap-2">
              {inviting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Add & Send Activation Link
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Manager Dialog */}
      <Dialog open={showManagerDialog} onOpenChange={setShowManagerDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              Add Warehouse Manager
            </DialogTitle>
            <DialogDescription>
              Invite a warehouse manager who can add and manage employees from their own dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input
                  value={mgrName}
                  onChange={(e) => setMgrName(e.target.value)}
                  placeholder="Sarah Williams"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input
                  type="email"
                  value={mgrEmail}
                  onChange={(e) => setMgrEmail(e.target.value)}
                  placeholder="sarah@warehouse.com"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Warehouse Name</Label>
              <Input
                value={mgrWarehouse}
                onChange={(e) => setMgrWarehouse(e.target.value)}
                placeholder="Amazon BWI5 / FedEx Ground Jessup"
                className="mt-1"
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="size-4 text-primary" />
                <span className="font-medium">Manager Permissions</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Warehouse managers can add employees, view their team, and manage schedules from the admin dashboard.
              </p>
            </div>

            <Button onClick={handleAddManager} disabled={mgrInviting} className="w-full gap-2">
              {mgrInviting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Invite Manager
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
