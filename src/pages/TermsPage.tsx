export function TermsPage() {
  return (
    <div className="py-16">
      <div className="container max-w-3xl prose prose-invert">
        <h1 className="text-4xl font-bold mb-8 not-prose">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: April 2026</p>
        <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Service Description</h2>
            <p>WarehouseRide LLC provides vanpool transportation services for employees traveling between their residences and workplaces in the Baltimore metro area. Services are subject to availability, minimum passenger requirements, and route optimization.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Eligibility & Minimums</h2>
            <p>A minimum of 8 passengers per single job location is required. WarehouseRide reserves the right to adjust, combine, or discontinue routes that fall below minimum requirements.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Pricing & Payment</h2>
            <p>Prices are subject to change based on fuel costs, distance, and other factors. Current pricing: Monthly ($280–$350), Bi-weekly ($155–$175), Weekly ($50), Daily ($17–$22). All prices are round-trip. Payment is due in advance of the service period.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Cancellations & Refunds</h2>
            <p>Riders must provide 24-hour notice for cancellations. Monthly and bi-weekly plans allow limited schedule flexibility. Refunds for unused portions are handled on a case-by-case basis.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Rider Responsibilities</h2>
            <p>Riders must be ready at their pickup location at the scheduled time. Repeated no-shows may result in route reassignment. All riders must wear seatbelts and conduct themselves respectfully.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Liability</h2>
            <p>WarehouseRide maintains commercial insurance. Liability is limited to the extent permitted by law. We are not responsible for delays caused by traffic, weather, or other circumstances beyond our control.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Modifications</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of services after changes constitutes acceptance of the new terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
