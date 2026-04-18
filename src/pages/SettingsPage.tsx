import { useMutation, useQuery } from "convex/react";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "../../convex/_generated/api";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHIFTS = ["Morning (4–8 AM)", "Day (8 AM–4 PM)", "Afternoon (2–6 PM)", "Night (6 PM–2 AM)", "Overnight (10 PM–6 AM)", "Custom"];

export function SettingsPage() {
  const profile = useQuery(api.customers.getMyProfile);
  const updateProfile = useMutation(api.customers.updateProfile);
  const [saving, setSaving] = useState(false);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [workplaceAddress, setWorkplaceAddress] = useState("");
  const [preferredShift, setPreferredShift] = useState("");
  const [customShiftTime, setCustomShiftTime] = useState("");
  const [workSchedule, setWorkSchedule] = useState<string[]>([]);
  const [scheduleNotes, setScheduleNotes] = useState("");

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setCity(profile.city || "");
      setWorkplace(profile.workplace || "");
      setWorkplaceAddress(profile.workplaceAddress || "");
      setPreferredShift(profile.preferredShift || "");
      setCustomShiftTime(profile.customShiftTime || "");
      setWorkSchedule(profile.workSchedule || []);
      setScheduleNotes(profile.scheduleNotes || "");
    }
  }, [profile]);

  const toggleDay = (day: string) => {
    setWorkSchedule((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        workplace: workplace || undefined,
        workplaceAddress: workplaceAddress || undefined,
        preferredShift: preferredShift || undefined,
        customShiftTime: customShiftTime || undefined,
        workSchedule: workSchedule.length > 0 ? workSchedule : undefined,
        scheduleNotes: scheduleNotes || undefined,
      });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and ride preferences.</p>
      </div>

      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={profile?.name || ""} disabled className="mt-1 opacity-60" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile?.email || ""} disabled className="mt-1 opacity-60" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(410) 555-0000" className="mt-1" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Baltimore" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Home Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Work Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Workplace Name</Label>
              <Input value={workplace} onChange={(e) => setWorkplace(e.target.value)} placeholder="Amazon BWI5" className="mt-1" />
            </div>
            <div>
              <Label>Workplace Address</Label>
              <Input value={workplaceAddress} onChange={(e) => setWorkplaceAddress(e.target.value)} placeholder="Workplace address" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Shift & Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Preferred Shift</Label>
              <Select value={preferredShift} onValueChange={setPreferredShift}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select shift" /></SelectTrigger>
                <SelectContent>
                  {SHIFTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {preferredShift === "Custom" && (
              <div>
                <Label>Custom Shift Time</Label>
                <Input value={customShiftTime} onChange={(e) => setCustomShiftTime(e.target.value)} placeholder="e.g. 3 AM - 1 PM" className="mt-1" />
              </div>
            )}
          </div>
          <div>
            <Label className="mb-2 block">Work Days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <label
                  key={day}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm cursor-pointer hover:bg-secondary/80"
                >
                  <Checkbox
                    checked={workSchedule.includes(day)}
                    onCheckedChange={() => toggleDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Schedule Notes</Label>
            <Textarea
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              placeholder="Any special schedule notes (e.g. alternating shifts, holidays, etc.)"
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
        <Save className="size-4" />
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
