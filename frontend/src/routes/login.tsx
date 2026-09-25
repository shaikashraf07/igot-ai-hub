import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Info, Lock, Mail, ShieldCheck } from "lucide-react";
import { Badge, Button } from "@/components/ui/primitives";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Learner Sign In | iGOT AI Hub" },
      {
        name: "description",
        content: "Civil service authentication portal for the iGOT AI Hub competency platform.",
      },
    ],
  }),
  component: LoginPage,
});

/** Demo credentials — validated at login but never displayed as plaintext in the UI */
const DEMO_EMAIL = "ashraf@gov.in";

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, activateDemoMode } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const { error } = await signIn(trimmedEmail, password);

    if (error) {
      setIsLoading(false);
      let userFriendlyError = error;
      if (error.toLowerCase().includes("email not confirmed")) {
        userFriendlyError =
          "Email address not confirmed yet. Please check your Gmail inbox and verify your email before signing in.";
      }
      setErrorMsg(userFriendlyError);
      toast.error(userFriendlyError);
    } else {
      setIsLoading(false);
      toast.success("Welcome back!");
      navigate({ to: "/" });
    }
  };

  const handleDemoQuickLogin = () => {
    activateDemoMode();
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
              <span className="font-semibold">Prototype Demonstration Mode:</span> Authentication is
              backed by Supabase. Use a Gmail address for prototype authentication testing or use
              one-click demo access.
            </div>
          </div>

          <div className="gov-card p-6 md:p-8">
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="mt-3 text-2xl font-bold text-foreground">Sign In</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your email address
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    aria-describedby="login-email-hint"
                    className="focus-ring w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground"
                  />
                </div>
                <p id="login-email-hint" className="mt-1 text-[11px] text-muted-foreground">
                  Use a Gmail address for prototype authentication.
                </p>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
              type="button"
              onClick={handleDemoQuickLogin}
              className="w-full justify-between text-left border-primary/30 hover:bg-primary/5"
            >
              <span>Continue as Demo Civil Servant (Ashraf)</span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Button>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              New learner?{" "}
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
