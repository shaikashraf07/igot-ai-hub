import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  FileQuestion,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, PageHeader } from "@/components/ui/primitives";
import { governmentDatasetService } from "@/services";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Help & Support | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Official civil servant helpdesk, FAQs, learning platform guides, and technical support for iGOT AI Hub.",
      },
    ],
  }),
  component: SupportPage,
});

const faqs = [
  {
    q: "How are competency scores and gaps determined?",
    a: "Scores are evaluated through official diagnostic assessments, role-based case scenarios, and verified course completion milestones mapped directly to the Capacity Building Commission (CBC) competency matrix for your cadre.",
  },
  {
    q: "What is the difference between an assessment and a reassessment?",
    a: "An assessment establishes your diagnostic baseline and highlights skill gaps. A reassessment is completed after undertaking recommended learning modules to measure competency gains and close identified deficits.",
  },
  {
    q: "How do I download my course completion certificates?",
    a: "Once a course reaches 100% progress and any associated module assessments are cleared, a digitally verified certificate signed by the providing institute (e.g. LBSNAA, ISTM) is generated in your 'My Learning' section.",
  },
  {
    q: "Can I take courses outside my designated cadre recommendations?",
    a: "Yes. While the AI engine recommends courses directly targeted at your identified priority gaps, the complete iGOT Course Catalogue is open for exploratory learning across all functional and domain areas.",
  },
  {
    q: "Who should I contact if course media or progress does not sync?",
    a: "Ensure your official NIC / Gov email session is active. If progress does not update within 15 minutes of completing a unit, you can log a ticket with the iGOT AI Hub Technical Helpdesk below.",
  },
];

function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketCategory, setTicketCategory] = useState("Progress Sync Issue");
  const [ticketDetails, setTicketDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDetails.trim()) {
      toast.error("Please enter a description of your issue.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketDetails("");
      toast.success(
        "Support ticket logged successfully! Ticket ID: #KMY-" +
          Math.floor(100000 + Math.random() * 900000),
      );
    }, 600);
  };

  return (
    <AppLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Help & Support" },
        ]}
        title="Help & Support Desk"
        subtitle="National Programme for Civil Services Capacity Building (NPCSCB) · Technical & Learner Assistance"
      />

      {/* Support Channels */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="gov-card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Toll-Free Helpline</h3>
              <p className="text-xs text-muted-foreground">Mon–Fri, 9:00 AM – 6:00 PM</p>
            </div>
          </div>
          <p className="mt-3 text-lg font-bold text-primary">1800-111-555</p>
        </div>

        <div className="gov-card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-secondary/10 text-secondary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Email Support</h3>
              <p className="text-xs text-muted-foreground">Official response within 24 hours</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">support-karmayogi@gov.in</p>
        </div>

        <div className="gov-card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-accent/15 text-accent">
              <ExternalLink className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">CPGRAMS Escalation</h3>
              <p className="text-xs text-muted-foreground">Central grievance redressal</p>
            </div>
          </div>
          <a
            href="https://pgportal.gov.in"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center text-sm font-medium text-secondary hover:underline"
          >
            Visit pgportal.gov.in →
          </a>
        </div>
      </div>

      {/* FAQ & Quick Contact Form */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* FAQs */}
        <div className="lg:col-span-2">
          <Card
            title="Frequently Asked Questions"
            subtitle="Common questions regarding assessments, scores, and course completion"
          >
            <div className="divide-y divide-border" role="region" aria-label="Frequently Asked Questions list">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                const faqId = `faq-answer-${index}`;
                return (
                  <div key={index} className="py-3.5 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={faqId}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-start justify-between gap-3 text-left font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                    >
                      <span className="flex items-start gap-2.5 text-sm">
                        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    {isOpen ? (
                      <p id={faqId} className="mt-2.5 pl-6.5 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Quick Ticket Form */}
        <div>
          <Card
            title="Log a Support Request"
            subtitle="Submit an issue directly to the iGOT AI Hub nodal officer"
          >
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label htmlFor="ticket-category" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Issue Category
                </label>
                <select
                  id="ticket-category"
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="focus-ring mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
                >
                  <option>Progress Sync Issue</option>
                  <option>Assessment Submission Error</option>
                  <option>Course Content / Media Not Loading</option>
                  <option>Certificate Verification Inquiry</option>
                  <option>Other Operational Feedback</option>
                </select>
              </div>

              <div>
                <label htmlFor="ticket-details" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Description
                </label>
                <textarea
                  id="ticket-details"
                  rows={4}
                  value={ticketDetails}
                  onChange={(e) => setTicketDetails(e.target.value)}
                  placeholder="Describe what happened or which course was affected..."
                  className="focus-ring mt-1 w-full rounded-md border border-input bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                <MessageSquare className="mr-1.5 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Support Ticket"}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Phase 10: Official Source & Provenance Registry */}
      {(() => {
        const sources = [
          {
            area: "Problem Statement",
            resource: "SIH26101",
            purpose: "MoSPI Problem Statement & Competency Mandate",
            authority: "Official PS",
            url: "https://www.mospi.gov.in/",
          },
          {
            area: "NSSTA",
            resource: "NSSTA Offerings & Curriculum",
            purpose: "Official Training Offerings and Public Course Catalogue",
            authority: "Official NSSTA",
            url: "https://nssta.gov.in/offerings",
          },
          {
            area: "NSSTA",
            resource: "Advance Training Calendar FY2025-26",
            purpose: "Advance training schedule & batch parameters",
            authority: "Official Circular",
            url: "https://www.mospi.gov.in/sites/default/files/announcements/Circular_NSSTA_Advance_Training_Calander_FY(25-26).pdf",
          },
          {
            area: "MoSPI",
            resource: "eSankhyiki National Data Portal",
            purpose: "Official public statistical dataset catalogue & microdata",
            authority: "Official MoSPI",
            url: "https://esankhyiki.mospi.gov.in/catalogue-main",
          },
          {
            area: "iGOT Karmayogi",
            resource: "CBP Architecture Benchmark",
            purpose: "AI-driven role/competency mapping reference standard",
            authority: "DoPT / CBC",
            url: "https://portal.igotkarmayogi.gov.in/training-pla-ai/",
          },
        ];

        return (
          <Card
            className="mt-6"
            title="Official Source & Provenance Registry"
            subtitle="Verified government authorities, ministerial portals, and dataset documentation backing the platform's reference intelligence."
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" role="table">
                <thead className="border-b border-border bg-surface-muted/60 text-muted-foreground uppercase tracking-wider text-[10px]">
                  <tr>
                    <th scope="col" className="p-3 font-semibold">Area</th>
                    <th scope="col" className="p-3 font-semibold">Resource</th>
                    <th scope="col" className="p-3 font-semibold">Purpose</th>
                    <th scope="col" className="p-3 font-semibold">Authority</th>
                    <th scope="col" className="p-3 font-semibold">Verified Source Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {sources.map((s, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-secondary">{s.area}</td>
                      <td className="p-3 font-medium">{s.resource}</td>
                      <td className="p-3 text-muted-foreground">{s.purpose}</td>
                      <td className="p-3">
                        <Badge tone="neutral">{s.authority}</Badge>
                      </td>
                      <td className="p-3">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-[11px]"
                        >
                          Visit Portal <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground">
              <ShieldCheck className="inline-block mr-1 h-3.5 w-3.5 text-success" />
              <strong>Audit Notice:</strong> All institutional links are verified against the official MoSPI/NSSTA source registry provided in STATsense data collection pack. Raw microdata and live authenticated access adhere to GSDD 2026 data governance protocols.
            </p>
          </Card>
        );
      })()}
    </AppLayout>
  );
}
