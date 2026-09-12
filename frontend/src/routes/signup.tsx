import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Info, Lock, Mail, ShieldCheck, User, Building } from "lucide-react";
import { Badge, Button } from "@/components/ui/primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Learner Registration | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Civil service onboard registration for the iGOT AI Hub competency platform.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cadre, setCadre] = useState("Central Secretariat Service (CSS)");
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Profile registered! Welcome to iGOT AI Hub.");
      navigate({ to: "/" });
    }, 500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Banner */}
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-white/10 text-sm font-bold">
              iG
            </span>
            <span className="leading-tight">
              <span className="block text-base font-semibold">iGOT AI Hub</span>
              <span className="hidden text-xs text-white/70 sm:block">
                National Programme for Civil Services Capacity Building
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="accent">SIH Prototype</Badge>
          </div>
        </div>
        <div className="h-[3px] w-full bg-accent" />
      </header>

      {/* Main Container */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Disclaimer Banner */}
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-secondary/30 bg-secondary/5 p-3.5 text-xs text-secondary">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <span className="font-semibold">Prototype Onboarding:</span> Accounts created here simulate local civil servant registration for the SIH evaluation demo.
            </div>
          </div>

          <div className="gov-card p-6 md:p-8">
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="mt-3 text-2xl font-bold text-foreground">Register Official Profile</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Join the competency-driven capacity building initiative
              </p>
            </div>

            <form onSubmit={handleSignup} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Full Name & Designation
                </label>
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar, Director"
                    className="focus-ring w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Official Email (@gov.in / @nic.in)
                </label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gov.in"
                    className="focus-ring w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cadre / Service
                </label>
                <select
                  value={cadre}
                  onChange={(e) => setCadre(e.target.value)}
                  className="focus-ring mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
                >
                  <option>Central Secretariat Service (CSS)</option>
                  <option>Indian Administrative Service (IAS)</option>
                  <option>Indian Police Service (IPS)</option>
                  <option>Indian Revenue Service (IRS)</option>
                  <option>Central Secretariat Stenographers Service (CSSS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Ministry / Department
                </label>
                <div className="relative mt-1">
                  <Building className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Ministry of Finance"
                    className="focus-ring w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="mt-2 w-full">
                {isLoading ? "Creating Profile..." : "Register & Begin Journey"}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              Already registered?{" "}
              <Link to="/login" className="font-semibold text-secondary hover:underline">
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
