import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  BookOpen,
  UserSquare2,
  TrendingDown,
  Sparkles,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  LifeBuoy,
  Settings,
  Search,
  Bell,
  Menu,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { learnerService } from "@/services";
import type { Learner } from "@/types/igot";
import { toast } from "sonner";
import { useAuth, useIsAuthenticated } from "@/lib/auth-context";
import { Badge } from "@/components/ui/primitives";

const mainNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-learning", label: "My Learning", icon: BookOpen },
  { to: "/competency-profile", label: "Competency Profile", icon: UserSquare2 },
  { to: "/skill-gaps", label: "Skill Gap Analysis", icon: TrendingDown },
  { to: "/recommendations", label: "Recommended Learning", icon: Sparkles },
  { to: "/courses", label: "iGOT Courses", icon: GraduationCap },
  { to: "/assessments", label: "Assessments", icon: ClipboardCheck },
  { to: "/progress", label: "Progress & Analytics", icon: BarChart3 },
] as const;

const bottomNav = [
  { to: "/support", label: "Help & Support", icon: LifeBuoy },
  { to: "/settings", label: "Profile & Settings", icon: Settings },
] as const;

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "focus-ring flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { signOut, isDemoMode, isLoading } = useAuth();
  const isAuthenticated = useIsAuthenticated();
  const [open, setOpen] = useState(false);
  const [learner, setLearner] = useState<Learner | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      learnerService.getProfile().then(setLearner);
    }
  }, [isAuthenticated]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileDropdownOpen(false);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/courses" });
    }
  };

  const handleBellClick = () => {
    toast.info("Notifications: 1 pending assessment review in Decision Making.", {
      action: {
        label: "View",
        onClick: () => navigate({ to: "/assessments" }),
      },
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully.");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* National Tricolor Identity Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" aria-hidden="true" />

      <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-xs">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <button
            className="focus-ring rounded-md p-2 hover:bg-white/10 lg:hidden cursor-pointer"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            aria-controls="mobile-sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="focus-ring flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-white/15 text-sm font-bold tracking-tight text-white shadow-xs">
              iG
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold tracking-tight text-white">iGOT AI Hub</span>
              <span className="hidden text-[11px] text-white/80 sm:block font-medium">
                National Programme for Civil Services Capacity Building
              </span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 xl:flex" aria-label="Quick Cadre Links">
            {["Learn", "Assess", "Grow", "Serve"].map((item) => (
              <span
                key={item}
                className="cursor-default rounded-md px-3 py-1.5 text-xs font-medium text-white/85 hover:bg-white/10"
              >
                {item}
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-white/60" aria-hidden="true" />
              <input
                id="header-course-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, competencies..."
                aria-label="Search courses and competencies"
                className="focus-ring w-56 lg:w-64 rounded-md bg-white/10 py-1.5 pl-8 pr-3 text-sm text-white placeholder:text-white/60 border border-white/10"
              />
            </form>
            <button
              onClick={handleBellClick}
              className="focus-ring relative rounded-md p-2 hover:bg-white/10 cursor-pointer"
              aria-label="Notifications (1 pending)"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
            </button>

            {/* Profile badge / dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md p-1 pl-2 hover:bg-white/10 focus-ring cursor-pointer"
                aria-label="User profile and account options"
                aria-haspopup="menu"
                aria-expanded={profileDropdownOpen}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-xs font-bold text-white shadow-xs">
                  {learner?.avatarInitials ?? (isLoading ? "..." : "C")}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-semibold text-white">
                    {learner?.name ?? (isLoading ? "Loading..." : "Civil Servant")}
                  </span>
                  <span className="block text-[11px] text-white/75 truncate max-w-[140px]">
                    {learner?.role ?? "Official Profile"}
                  </span>
                </span>
              </button>

              {profileDropdownOpen ? (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-md border border-border bg-card p-1.5 shadow-lg text-foreground z-50 animate-in fade-in-50 zoom-in-95 duration-100"
                  role="menu"
                  aria-label="User Account Menu"
                >
                  <div className="border-b border-border px-3 py-2">
                    <p className="text-xs font-bold text-primary">{learner?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{learner?.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {isDemoMode ? (
                        <Badge tone="accent">Demo Civil Servant (Ashraf)</Badge>
                      ) : (
                        <Badge tone="success">Parichay Verified</Badge>
                      )}
                    </div>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 rounded px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted"
                    role="menuitem"
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    Profile & Settings
                  </Link>
                  <Link
                    to="/support"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 rounded px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted"
                    role="menuitem"
                  >
                    <LifeBuoy className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    Help & Support
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 cursor-pointer"
                    role="menuitem"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="h-[2px] w-full bg-accent" />
      </header>

      {/* Backdrop for mobile navigation drawer */}
      {open ? (
        <div
          className="fixed inset-0 top-16 z-20 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <div className="mx-auto flex w-full max-w-[1500px] flex-1">
        <aside
          id="mobile-sidebar"
          className={cn(
            "fixed inset-y-16 left-0 z-30 w-64 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar p-3 shadow-lg lg:shadow-none lg:sticky lg:top-[67px] lg:block lg:h-[calc(100vh-67px)]",
            open ? "block" : "hidden",
          )}
          aria-label="Navigation Sections"
        >
          <nav className="flex h-full flex-col">
            <div className="space-y-1" role="list">
              {mainNav.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  active={isActive(item.to)}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
            <div className="mt-auto space-y-1 border-t border-sidebar-border pt-3" role="list">
              {bottomNav.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  active={isActive(item.to)}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
          </nav>
        </aside>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex min-w-0 flex-1 flex-col justify-between px-4 py-6 md:px-8 focus:outline-none"
        >
          <div>{children}</div>
          <footer className="mt-12 border-t border-border pt-6 pb-6 text-xs text-muted-foreground">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-bold text-foreground">iGOT AI Hub</span>
                <span>•</span>
                <span>Capacity Building Commission (CBC)</span>
                <span>•</span>
                <span>Ministry of Personnel, Public Grievances & Pensions</span>
              </div>
              <p>© {new Date().getFullYear()} iGOT AI Hub · Mission Karmayogi</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
