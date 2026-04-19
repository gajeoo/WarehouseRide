import { ArrowRight, CheckCircle2, Info, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type PlanKey = "daily" | "weekly" | "biweekly" | "monthly";

const plans: Array<{
  key: PlanKey;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlight: boolean;
}> = [
  {
    key: "daily",
    name: "Daily",
    price: "$17–$22",
    period: "per day",
    desc: "Pay as you go. Perfect for occasional shifts or trying us out.",
    features: ["Round-trip transportation", "Any shift schedule", "Door-to-door pickup", "No commitment"],
    highlight: false,
  },
  {
    key: "weekly",
    name: "Weekly",
    price: "$50",
    period: "per week",
    desc: "Great for part-time workers or weekly scheduling flexibility.",
    features: ["Round-trip transportation", "Any shift schedule", "Door-to-door pickup", "Save vs daily rate"],
    highlight: false,
  },
  {
    key: "biweekly",
    name: "Bi-Weekly",
    price: "$155–$175",
    period: "every 2 weeks",
    desc: "Aligned with most paycheck cycles. Popular with full-time staff.",
    features: ["Round-trip transportation", "Any shift schedule", "Door-to-door pickup", "Paycheck-friendly billing", "Priority scheduling"],
    highlight: false,
  },
  {
    key: "monthly",
    name: "Monthly",
    price: "$280–$350",
    period: "per month",
    desc: "The best value for full-time employees. Maximum savings, zero hassle.",
    features: ["Round-trip transportation", "Any shift schedule", "Door-to-door pickup", "Best per-day rate", "Priority scheduling", "Schedule flexibility"],
    highlight: true,
  },
];

export function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const createCheckout = useAction(api.stripe.createCheckoutSession);

  const handleSubscribe = async (planKey: PlanKey) => {
    setLoadingPlan(planKey);
    try {
      const result = await createCheckout({ plan: planKey });
      if (result.error) {
        toast.error(result.error);
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      // If Stripe is not configured, fallback to quote form
      toast.info("Online payments coming soon! Please request a quote for now.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All plans include round-trip transportation from your home to your workplace and back. Prices may vary based on distance and fuel costs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.highlight ? "border-primary ring-1 ring-primary bg-card" : "bg-card/50 border-border"}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  Best Value
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.desc}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-success shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2 mt-6">
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    disabled={loadingPlan !== null}
                    onClick={() => handleSubscribe(plan.key)}
                  >
                    {loadingPlan === plan.key ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Subscribe Now"
                    )}
                  </Button>
                  <Button className="w-full" variant="ghost" size="sm" asChild>
                    <Link to="/get-quote">Get Custom Quote</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-12">
          <Card className="bg-info/5 border-info/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="size-5 text-info shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Important Notes</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Minimum of 8 passengers per single job location required</li>
                    <li>• Prices are subject to change based on fuel costs and distance</li>
                    <li>• All prices are for round-trip (home → work → home)</li>
                    <li>• Custom quotes available for larger groups and special schedules</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">Need a custom quote for your team?</p>
            <Button size="lg" asChild>
              <Link to="/get-quote">
                Request Custom Quote
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
