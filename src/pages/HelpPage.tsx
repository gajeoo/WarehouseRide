import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How does WarehouseRide work?", a: "We operate like a school bus for the workforce. We pick you up from your home, drive you to your workplace, and bring you home after your shift. You share the van with coworkers going to the same location." },
  { q: "What are the minimum requirements?", a: "We need a minimum of 8 passengers per single job location. This helps us optimize routes and keep pricing affordable for everyone." },
  { q: "What shifts do you cover?", a: "We cover ALL shifts — morning, day, afternoon, evening, and overnight. Early starts at 4 AM? Late shifts ending at 2 AM? We've got you covered." },
  { q: "How much does it cost?", a: "Monthly: $280–$350, Bi-weekly: $155–$175, Weekly: $50, Daily: $17–$22. All prices are round-trip and may vary based on fuel costs and distance." },
  { q: "What areas do you serve?", a: "We currently serve Baltimore, Columbia, Laurel, Elkridge, Jessup, Ellicott City, and Silver Spring in the greater Baltimore metro area." },
  { q: "What if I need to cancel a day?", a: "Contact us at least 24 hours in advance. Monthly and bi-weekly plans have flexible policies for occasional absences." },
  { q: "How do I sign up?", a: "Start by requesting a quote on our Get a Quote page. We'll contact you within 24 hours to discuss your needs and set up your route." },
  { q: "Can my company sponsor the service?", a: "Absolutely! Many employers cover transportation costs as a benefit. Contact us about corporate accounts and employer-sponsored plans." },
];

export function HelpPage() {
  return (
    <div className="py-16">
      <div className="container max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Find answers to common questions about WarehouseRide services.
        </p>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={`faq-${i}`} value={`faq-${i}`} className="border border-border rounded-lg bg-card/50 px-4">
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Button asChild>
            <Link to="/contact">Contact Our Team</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
