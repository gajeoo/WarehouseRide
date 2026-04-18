export function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="container max-w-3xl prose prose-invert">
        <h1 className="text-4xl font-bold mb-8 not-prose">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: April 2026</p>
        <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect information you provide directly, including name, email, phone number, home address, workplace address, and payment information. We also collect usage data such as ride history and route preferences.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>We use your information to provide transportation services, process payments, communicate about your rides, improve our services, and comply with legal obligations. We never sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Data Sharing</h2>
            <p>We share information only with service providers who help us operate (payment processors, mapping services), when required by law, or with your explicit consent. Your home address is shared only with your assigned driver for pickup purposes.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, secure data storage, and access controls. However, no method of electronic transmission is 100% secure.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time. Contact us at info@warehouseride.com to exercise these rights.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
            <p>For privacy questions, contact us at info@warehouseride.com or through our Contact page.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
