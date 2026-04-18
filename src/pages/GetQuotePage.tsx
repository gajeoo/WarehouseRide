import { useMutation } from "convex/react";
import { Calculator, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";

const serviceAreas = ["Baltimore", "Columbia", "Laurel", "Elkridge", "Jessup", "Ellicott City", "Silver Spring", "Other"];
const plans = ["Monthly ($280–$350)", "Bi-Weekly ($155–$175)", "Weekly ($50)", "Daily ($17–$22)"];
const shifts = ["Morning (4–8 AM)", "Day (8 AM–4 PM)", "Afternoon (2–6 PM)", "Night (6 PM–2 AM)", "Overnight (10 PM–6 AM)", "Custom"];

export function GetQuotePage() {
  const submitQuote = useMutation(api.quotes.submit);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [employees, setEmployees] = useState(8);
  const [plan, setPlan] = useState("");
  const [area, setArea] = useState("");
  const [shift, setShift] = useState("");

  // Quote calculator
  const estimateMonthly = () => {
    if (employees < 8) return null;
    const base = 315; // mid-range monthly
    const discount = Math.min(employees * 0.005, 0.15); // up to 15% group discount
    const perPerson = base * (1 - discount);
    return { perPerson: Math.round(perPerson), total: Math.round(perPerson * employees) };
  };

  const estimate = estimateMonthly();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await submitQuote({
        name: data.get("name") as string,
        email: data.get("email") as string,
        phone: (data.get("phone") as string) || undefined,
        company: (data.get("company") as string) || undefined,
        pickupArea: area,
        workplaceAddress: data.get("workplace") as string,
        numberOfEmployees: employees,
        preferredPlan: plan,
        shift: shift,
        notes: (data.get("notes") as string) || undefined,
      });
      toast.success("Quote request submitted! We'll get back to you within 24 hours.");
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-16">
        <div className="container max-w-lg text-center">
          <div className="size-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="size-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Quote Request Submitted!</h1>
          <p className="text-muted-foreground leading-relaxed">
            Thank you for your interest in WarehouseRide. Our team will review your details and get back to you within 24 hours with a custom quote for your team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Get a Free Quote</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tell us about your team and we'll create a custom transportation plan. No commitment required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="bg-card/50 border-border">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Your Name *</Label>
                      <Input id="name" name="name" required placeholder="Full name" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" required placeholder="you@email.com" className="mt-1" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" placeholder="(410) 555-0000" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="company">Company / Employer</Label>
                      <Input id="company" name="company" placeholder="Warehouse name" className="mt-1" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Pickup Area *</Label>
                      <Select value={area} onValueChange={setArea} required>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select area" /></SelectTrigger>
                        <SelectContent>
                          {serviceAreas.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="workplace">Workplace Address *</Label>
                      <Input id="workplace" name="workplace" required placeholder="Warehouse address" className="mt-1" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Number of Employees *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={employees}
                        onChange={(e) => setEmployees(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Preferred Plan</Label>
                      <Select value={plan} onValueChange={setPlan}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select plan" /></SelectTrigger>
                        <SelectContent>
                          {plans.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Shift Time *</Label>
                      <Select value={shift} onValueChange={setShift} required>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select shift" /></SelectTrigger>
                        <SelectContent>
                          {shifts.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Special requirements, multiple shifts, etc." rows={3} className="mt-1" />
                  </div>
                  <Button type="submit" disabled={loading} size="lg" className="w-full">
                    {loading ? "Submitting..." : "Submit Quote Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Quote calculator sidebar */}
          <div>
            <Card className="bg-gradient-to-b from-primary/5 to-transparent border-primary/20 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="size-5 text-primary" />
                  Quick Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Team Size</div>
                    <div className="text-2xl font-bold">{employees} riders</div>
                  </div>
                  {employees < 8 ? (
                    <div className="text-sm text-warning">
                      Minimum 8 passengers required per route. Add more to see estimate.
                    </div>
                  ) : estimate ? (
                    <>
                      <div className="border-t border-border pt-3">
                        <div className="text-sm text-muted-foreground">Est. Monthly / Person</div>
                        <div className="text-2xl font-bold text-primary">~${estimate.perPerson}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Est. Monthly Total</div>
                        <div className="text-lg font-semibold">~${estimate.total.toLocaleString()}</div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        *Estimates only. Final pricing depends on distance, route, and other factors.
                      </p>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
