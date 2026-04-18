import { Building2, Heart, Shield, Target, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AboutPage() {
  return (
    <div className="py-16">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">About WarehouseRide</h1>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          WarehouseRide LLC was founded with a simple mission: make getting to work reliable and affordable for every warehouse employee in the Baltimore metro area.
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                Many warehouse workers face a daily challenge that most people never think about — simply getting to work. Shifts start early, end late, and public transit doesn't always cover the industrial areas where warehouses operate. For workers without reliable personal vehicles, this creates a constant source of stress and uncertainty.
              </p>
              <p>
                WarehouseRide was created to solve this problem. We operate like a school bus service for the workforce: we pick employees up from their homes, transport them to their shared workplace, and bring them home after their shift. It's simple, reliable, and affordable.
              </p>
              <p>
                Based in the Baltimore metro area, we serve major warehouse hubs in Baltimore, Columbia, Laurel, Elkridge, Jessup, Ellicott City, and Silver Spring. We accommodate all shifts — including early morning and late night schedules that other transportation options don't cover.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Our Values</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "Reliability", desc: "We show up. Every shift, every day. Your job depends on getting there on time, and we take that seriously." },
                { icon: Heart, title: "Accessibility", desc: "Affordable transportation shouldn't be a luxury. Our flexible plans make commuting accessible to every worker." },
                { icon: Users, title: "Community", desc: "We build connections among coworkers. Riding together creates bonds that strengthen workplace culture." },
                { icon: Target, title: "Growth", desc: "We're actively pursuing government contracts to expand services to students, elderly, and disabled individuals." },
              ].map((v) => (
                <Card key={v.title} className="bg-card/50 border-border">
                  <CardContent className="pt-6">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <v.icon className="size-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <Card className="bg-gradient-to-r from-primary/5 to-info/5 border-border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground leading-relaxed">
                      We're working toward securing government contracts that would allow us to extend our services beyond warehouse employees to students, individuals with disabilities, and elderly residents. WarehouseRide aims to become the backbone of workforce transportation in the Baltimore metro area — making opportunity accessible through reliable rides.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
