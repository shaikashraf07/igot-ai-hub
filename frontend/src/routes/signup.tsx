import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Info, Lock, Mail, ShieldCheck, User, Building } from "lucide-react";
import { Badge, Button } from "@/components/ui/primitives";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Learner Registration | iGOT AI Hub" },
      {
        name: "description",
        content: "Learner registration and onboarding for the iGOT AI Hub competency platform.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cadre, setCadre] = useState("Central Secretariat Service (CSS)");
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const isGmail = trimmedEmail.endsWith("@gmail.com");
    const isGovEmail = trimmedEmail.endsWith("@gov.in") || trimmedEmail.endsWith("@nic.in");
    const atIndex = trimmedEmail.indexOf("@");
    const hasValidLocal = atIndex > 0 && !/\s/.test(trimmedEmail);

    if (!hasValidLocal || (!isGmail && !isGovEmail)) {
      setIsLoading(false);
      const err = "Please enter a valid Gmail address (@gmail.com) for prototype authentication.";
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    // Split name into full name and role (e.g. "Rajesh Kumar, Director")
    const parts = name.split(",");
    const actualName = (parts[0] ?? "").trim();
    const role = parts.length > 1 && parts[1] ? parts[1].trim() : "Under Secretary";

    const { error, needsEmailConfirmation } = await signUp(trimmedEmail, password, {
      name: actualName,
      role,
      department,
      cadre,
    });

    if (error) {
      setIsLoading(false);
      let friendlyError = error;
      if (error.toLowerCase().includes("rate limit")) {
        friendlyError =
          "Supabase email rate limit exceeded (free tier default is limited to 3-4 emails/hour). Please wait a few minutes, or disable email confirmation / add custom SMTP in your Supabase dashboard.";
      }
      setErrorMsg(friendlyError);
      toast.error(friendlyError);
    } else if (needsEmailConfirmation) {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success("Confirmation email sent! Please check your Gmail inbox.");
    } else {
      setIsLoading(false);
      toast.success("Profile registered! Welcome to iGOT AI Hub.");
      navigate({ to: "/" });
    }
  };

  if (isSubmitted) {
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
            <div className="gov-card p-6 md:p-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-7 w-7" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-foreground">Verify Your Email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                A Supabase confirmation link has been sent to:
              </p>
              <p className="mt-1 font-semibold text-foreground break-all">
                {email.trim().toLowerCase()}
              </p>

              <div className="my-6 rounded-lg border border-secondary/30 bg-secondary/5 p-4 text-left text-xs text-secondary leading-relaxed space-y-1.5">
                <span className="font-semibold block text-secondary">Next steps:</span>
                <div>1. Open your Gmail inbox.</div>
                <div>2. Click the confirmation link from Supabase.</div>
                <div>3. Sign in to your verified account.</div>
              </div>

              <Button
                onClick={() => navigate({ to: "/login" })}
                className="w-full"
              >
                Go to Sign In
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              <span className="font-semibold">Prototype Onboarding:</span> Enter your email address.
              Use a Gmail address for prototype authentication testing.
            </div>
          </div>

          <div className="gov-card p-6 md:p-8">
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="mt-3 text-2xl font-bold text-foreground">Register Profile</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Join the competency-driven capacity building initiative
              </p>
            </div>

            <form onSubmit={handleSignup} className="mt-6 space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Full Name & Designation
                </label>
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-name"
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
                <label htmlFor="signup-email" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    aria-describedby="signup-email-hint"
                    className="focus-ring w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground"
                  />
                </div>
                <p id="signup-email-hint" className="mt-1 text-[11px] text-muted-foreground">
                  Use a Gmail address for prototype authentication.
                </p>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="focus-ring w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-cadre" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cadre / Service
                </label>
                <select
                  id="signup-cadre"
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
                <label htmlFor="signup-department" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Ministry / Department
                </label>
                <div className="relative mt-1">
                  <Building className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-department"
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Ministry of Finance"
                    className="focus-ring w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground"
                  />
                </div>
              </div>

              {errorMsg && (
                <div role="alert" aria-live="polite" className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm font-medium text-destructive">
                  {errorMsg}
                </div>
              )}

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
