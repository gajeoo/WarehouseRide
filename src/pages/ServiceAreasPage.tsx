import { ArrowRight, Building, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const areas = [
  {
    name: "Baltimore",
    desc: "Downtown Baltimore, Dundalk, Sparrows Point, and surrounding neighborhoods. Major hubs: Amazon BWI5, FedEx, UPS.",
    warehouses: ["Amazon BWI5", "Amazon DCA6", "UPS Worldport", "FedEx Ground"],
  },
  {
    name: "Columbia",
    desc: "Columbia, Howard County areas. Easy access to Jessup and Elkridge warehouse districts.",
    warehouses: ["Target Distribution", "Sysco Foods", "Columbia Gateway"],
  },
  {
    name: "Laurel",
    desc: "Laurel and surrounding Prince George's County areas. Central location between DC and Baltimore.",
    warehouses: ["Amazon DWA1", "IKEA Distribution", "Sysco Central"],
  },
  {
    name: "Elkridge",
    desc: "Elkridge industrial corridor along Route 1. Dense concentration of warehouses and distribution centers.",
    warehouses: ["UPS Elkridge", "DHL Supply Chain", "Various Fulfillment"],
  },
  {
    name: "Jessup",
    desc: "Jessup industrial park area. One of the region's largest warehouse hubs.",
    warehouses: ["FedEx Ground Hub", "XPO Logistics", "Performance Food Group"],
  },
  {
    name: "Ellicott City",
    desc: "Ellicott City and western Howard County. Residential pickup areas with easy highway access.",
    warehouses: ["Regional Distribution", "Various Employers"],
  },
  {
    name: "Silver Spring",
    desc: "Silver Spring and upper Montgomery County. Southern routes connecting to Baltimore-area workplaces.",
    warehouses: ["Various Employers", "Government Facilities"],
  },
];

export function ServiceAreasPage() {
  return (
    <div className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Service Areas</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We serve the greater Baltimore metro area, connecting workers from their neighborhoods to major warehouse and distribution hubs.
          </p>
        </div>

        {/* Map placeholder */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-card/50 border-border overflow-hidden">
            <div className="aspect-[2/1] bg-gradient-to-br from-primary/5 via-card to-info/5 flex items-center justify-center relative">
              <div className="text-center">
                <MapPin className="size-12 text-primary mx-auto mb-3 opacity-60" />
                <p className="text-muted-foreground text-sm">Baltimore Metro Coverage Area</p>
                <p className="text-xs text-muted-foreground mt-1">7 service areas • 25+ warehouse destinations</p>
              </div>
              {/* Decorative dots for area markers */}
              <div className="absolute top-[30%] left-[45%] size-3 rounded-full bg-primary animate-pulse" />
              <div className="absolute top-[50%] left-[35%] size-2.5 rounded-full bg-info animate-pulse delay-300" />
              <div className="absolute top-[60%] left-[50%] size-2.5 rounded-full bg-info animate-pulse delay-700" />
              <div className="absolute top-[40%] left-[55%] size-2 rounded-full bg-primary/60 animate-pulse delay-500" />
              <div className="absolute top-[55%] left-[40%] size-2 rounded-full bg-primary/60 animate-pulse delay-150" />
              <div className="absolute top-[45%] left-[60%] size-2 rounded-full bg-info/60 animate-pulse delay-1000" />
              <div className="absolute top-[65%] left-[30%] size-2 rounded-full bg-info/60 animate-pulse delay-200" />
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {areas.map((area) => (
            <Card key={area.name} className="bg-card/50 border-border hover:border-primary/20 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="size-5 text-primary" />
                  <h3 className="font-semibold text-lg">{area.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{area.desc}</p>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Building className="size-3.5" />
                    Key Destinations
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {area.warehouses.map((w) => (
                      <span key={w} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Don't see your area? We're expanding — reach out and let us know.</p>
          <Button size="lg" asChild>
            <Link to="/get-quote">
              Request a Quote for Your Area
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
