import { CheckCircle2, Shield, UserCheck, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SafetyPage() {
  return (
    <div className="py-16">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Safety First</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Your safety is our top priority. Here's how we ensure every ride is safe and comfortable.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: UserCheck, title: "Vetted Drivers", items: ["Background checks for all drivers", "Commercial driving licenses required", "Regular performance reviews", "Drug and alcohol testing"] },
            { icon: Wrench, title: "Vehicle Maintenance", items: ["Regular safety inspections", "Pre-trip vehicle checks daily", "Maintenance logs and tracking", "Modern, well-maintained fleet"] },
            { icon: Shield, title: "Insurance & Compliance", items: ["Full commercial insurance coverage", "DOT compliance", "State and local permits", "Worker's compensation coverage"] },
            { icon: CheckCircle2, title: "Rider Safety", items: ["Seatbelts in all vehicles", "Clean and sanitized vehicles", "GPS tracking on all routes", "24/7 emergency contact support"] },
          ].map((section) => (
            <Card key={section.title} className="bg-card/50 border-border">
              <CardContent className="pt-6">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <section.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-success shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
