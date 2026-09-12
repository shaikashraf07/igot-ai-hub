import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Info, Lock, Mail, ShieldCheck } from "lucide-react";
import { Badge, Button } from "@/components/ui/primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Learner Sign In | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Civil service authentication portal for the iGOT AI Hub competency platform.",
      },
    ],
  }),
  component: LoginPage,
});

/** Demo credentials — validated at login but never displayed as plaintext in the UI */
const DEMO_EMAIL = "ashraf@gov.in";
const DEMO_PASSWORD = "ashraf@069";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate demo credentials
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Welcome back, Ashraf!");
        navigate({ to: "/" });
      }, 400);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        toast.error("Invalid credentials. Please use the demo login credentials.");
      }, 400);
    }
  };

  const handleDemoQuickLogin = () => {
    toast.success("Authenticated as Ashraf (Demo Civil Servant)");
    navigate({ to: "/" });
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
              <span className="font-semibold">Prototype Demonstration Mode:</span> This interface simulates Parichay / NIC single-sign-on. Authentication is not yet backed by real Supabase/production credentials.
            </div>
          </div>

          <div className="gov-card p-6 md:p-8">
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="mt-3 text-2xl font-bold text-foreground">Sign In</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your official government credentials or Parichay ID
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Government Email / Parichay ID
                </label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gov.in or name@nic.in"
                    className="focus-ring w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Password / PIN
                </label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="focus-ring w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="mt-2 w-full">
                {isLoading ? "Signing in..." : "Sign In to iGOT AI Hub"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or one-click test</span>
              </div>
            </div>

            {/* Quick Demo Access Button */}
            <Button
              variant="outline"
              onClick={handleDemoQuickLogin}
              className="w-full justify-between text-left border-primary/30 hover:bg-primary/5"
            >
              <span>Continue as Demo Civil Servant (Ashraf)</span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Button>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              New official learner?{" "}
              <Link to="/signup" className="font-semibold text-secondary hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
