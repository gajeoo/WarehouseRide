import { useMutation, useQuery } from "convex/react";
import { Mail, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "../../convex/_generated/api";

export function AdminSettingsPage() {
  const settings = useQuery(api.settings.getAll);
  const setSetting = useMutation(api.settings.set);
  const customers = useQuery(api.customers.list);
  const contactMessages = useQuery(api.contact.list);
  const updateContactStatus = useMutation(api.contact.updateStatus);

  const admins = customers?.filter((c) => c.isAdmin) || [];

  // Pricing state
  const [monthlyMin, setMonthlyMin] = useState("280");
  const [monthlyMax, setMonthlyMax] = useState("350");
  const [biweeklyMin, setBiweeklyMin] = useState("155");
  const [biweeklyMax, setBiweeklyMax] = useState("175");
  const [weeklyPrice, setWeeklyPrice] = useState("50");
  const [dailyMin, setDailyMin] = useState("17");
  const [dailyMax, setDailyMax] = useState("22");
  const [pricingSaving, setPricingSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      const p = settings as Record<string, string>;
      if (p["pricing.monthly.min"]) setMonthlyMin(p["pricing.monthly.min"]);
      if (p["pricing.monthly.max"]) setMonthlyMax(p["pricing.monthly.max"]);
      if (p["pricing.biweekly.min"]) setBiweeklyMin(p["pricing.biweekly.min"]);
      if (p["pricing.biweekly.max"]) setBiweeklyMax(p["pricing.biweekly.max"]);
      if (p["pricing.weekly"]) setWeeklyPrice(p["pricing.weekly"]);
      if (p["pricing.daily.min"]) setDailyMin(p["pricing.daily.min"]);
      if (p["pricing.daily.max"]) setDailyMax(p["pricing.daily.max"]);
    }
  }, [settings]);

  const savePricing = async () => {
    setPricingSaving(true);
    try {
      await Promise.all([
        setSetting({ key: "pricing.monthly.min", value: monthlyMin }),
        setSetting({ key: "pricing.monthly.max", value: monthlyMax }),
        setSetting({ key: "pricing.biweekly.min", value: biweeklyMin }),
        setSetting({ key: "pricing.biweekly.max", value: biweeklyMax }),
        setSetting({ key: "pricing.weekly", value: weeklyPrice }),
        setSetting({ key: "pricing.daily.min", value: dailyMin }),
        setSetting({ key: "pricing.daily.max", value: dailyMax }),
      ]);
      toast.success("Pricing updated!");
    } catch {
      toast.error("Failed to update pricing.");
    } finally {
      setPricingSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Manage pricing, admins, and site configuration.</p>
      </div>

      {/* Pricing */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="size-5 text-primary" />
            Pricing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Monthly Min</Label>
              <Input type="number" value={monthlyMin} onChange={(e) => setMonthlyMin(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Monthly Max</Label>
              <Input type="number" value={monthlyMax} onChange={(e) => setMonthlyMax(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Bi-weekly Min</Label>
              <Input type="number" value={biweeklyMin} onChange={(e) => setBiweeklyMin(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Bi-weekly Max</Label>
              <Input type="number" value={biweeklyMax} onChange={(e) => setBiweeklyMax(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Weekly</Label>
              <Input type="number" value={weeklyPrice} onChange={(e) => setWeeklyPrice(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Daily Min</Label>
              <Input type="number" value={dailyMin} onChange={(e) => setDailyMin(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Daily Max</Label>
              <Input type="number" value={dailyMax} onChange={(e) => setDailyMax(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={savePricing} disabled={pricingSaving}>
            <Save className="size-4" />
            {pricingSaving ? "Saving..." : "Update Pricing"}
          </Button>
        </CardContent>
      </Card>

      {/* Admin users */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length > 0 ? (
            <div className="space-y-2">
              {admins.map((a) => (
                <div key={a._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <div className="font-medium text-sm">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.email}</div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Admin</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No admin users configured.</p>
          )}
        </CardContent>
      </Card>

      {/* Contact messages */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="size-5 text-primary" />
            Contact Messages ({contactMessages?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contactMessages && contactMessages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contactMessages.map((msg) => (
                  <TableRow key={msg._id}>
                    <TableCell className="text-sm font-medium">{msg.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{msg.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{msg.subject || "—"}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs capitalize ${
                        msg.status === "new" ? "bg-info/10 text-info border-info/20" :
                        msg.status === "replied" ? "bg-success/10 text-success border-success/20" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {msg.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {msg.status === "new" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            updateContactStatus({ id: msg._id, status: "replied" });
                            toast.success("Marked as replied.");
                          }}
                        >
                          Mark Replied
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No contact messages yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
