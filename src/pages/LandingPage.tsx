import {
  ArrowRight,
  Bus,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Users,
    title: "1. Gather Your Team",
    desc: "Organize 8+ employees at your workplace who need reliable transportation.",
  },
  {
    icon: MapPin,
    title: "2. Request a Quote",
    desc: "Tell us your pickup area, workplace, and shift times. We'll build a custom route.",
  },
  {
    icon: Bus,
    title: "3. Ride to Work",
    desc: "We pick you up from home and deliver you to work — every shift, every day.",
  },
];

const pricing = [
  { plan: "Monthly", price: "$280–$350", period: "/month", best: true },
  { plan: "Bi-weekly", price: "$155–$175", period: "/2 weeks", best: false },
  { plan: "Weekly", price: "$50", period: "/week", best: false },
  { plan: "Daily", price: "$17–$22", period: "/day", best: false },
];

const areas = ["Baltimore", "Columbia", "Laurel", "Elkridge", "Jessup", "Ellicott City", "Silver Spring"];

const testimonials = [
  { name: "Marcus J.", role: "Amazon BWI5 Associate", text: "No more stressing about my car breaking down before a night shift. WarehouseRide is there every time.", rating: 5 },
  { name: "Priya K.", role: "FedEx Ground Worker", text: "The monthly plan saves me so much compared to gas and parking. Plus I can rest on the ride in.", rating: 5 },
  { name: "James T.", role: "Warehouse Supervisor", text: "We signed up 12 of our team. Attendance went up and everyone's on time now.", rating: 5 },
];

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-info/5 pointer-events-none" />
        <div className="container relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Bus className="size-4" />
              Baltimore Metro Vanpool Service
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
              Your Ride to Work,
              <br />
              <span className="text-primary">Every Shift.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              Reliable vanpool transportation for warehouse employees in the Baltimore metro area.
              Picked up from home, delivered to work — all shifts, all routes. Starting at just $17/day.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/get-quote">
                  Get a Free Quote
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-accent">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-success" /> All shifts covered</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-success" /> Door-to-door service</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-success" /> Flexible plans</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Getting started is simple. Three steps to reliable daily transportation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <Card key={step.title} className="bg-card/50 border-border">
                <CardContent className="pt-6">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 border-t border-border bg-card/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Round-trip transportation from your door to work. Choose the plan that fits your schedule.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {pricing.map((p) => (
              <Card
                key={p.plan}
                className={`relative bg-card/60 ${p.best ? "border-primary ring-1 ring-primary" : "border-border"}`}
              >
                {p.best && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Best Value
                  </div>
                )}
                <CardContent className="pt-6 text-center">
                  <h3 className="font-medium text-muted-foreground mb-2">{p.plan}</h3>
                  <div className="text-2xl font-bold">{p.price}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.period} • round-trip</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button variant="outline" asChild className="bg-accent">
              <Link to="/pricing">See Full Pricing Details <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Service areas */}
      <section className="py-20 border-t border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Service Areas</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Serving warehouse hubs and workplaces across the Baltimore metro area.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {areas.map((area) => (
              <div
                key={area}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium"
              >
                <MapPin className="size-3.5 text-primary" />
                {area}
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button variant="outline" asChild className="bg-accent">
              <Link to="/service-areas">Explore All Areas <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-20 border-t border-border bg-card/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why WarehouseRide?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Clock, title: "All Shifts", desc: "Morning, afternoon, night — we cover every warehouse shift schedule." },
              { icon: DollarSign, title: "Affordable", desc: "Starting at $17/day. Save on gas, parking, and car maintenance." },
              { icon: Shield, title: "Reliable", desc: "Professional drivers, maintained vehicles, on-time every day." },
              { icon: Users, title: "Team Friendly", desc: "Group your coworkers for the best rates. 8+ riders per route." },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="size-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What Our Riders Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-card/50 border-border">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={`star-${t.name}-${i}`} className="size-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border bg-gradient-to-r from-primary/10 via-primary/5 to-info/10">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Ride?</h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
            Get a free custom quote for your team. No commitment, no hassle.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/get-quote">
                Get Your Free Quote
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-accent">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
