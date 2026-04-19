import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const planNames: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
};

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "";
  const planName = planNames[plan] || "Selected";

  return (
    <div className="py-16">
      <div className="container max-w-lg mx-auto">
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="size-16 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Your *{planName} Plan* subscription has been activated. Welcome to
              WarehouseRide!
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                  Your account has been upgraded to the {planName} plan
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                  You'll receive a confirmation email shortly
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                  Our team will assign you a route and pickup schedule
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                  You can manage your subscription from the Invoices page
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/invoices">View Subscription</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
