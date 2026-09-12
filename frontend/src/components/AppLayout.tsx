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
      className={cn(
        "focus-ring flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [learner, setLearner] = useState<Learner | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    learnerService.getProfile().then(setLearner);
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <button
            className="focus-ring rounded-md p-2 hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="focus-ring flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-white/10 text-sm font-bold">
              iG
            </span>
            <span className="leading-tight">
              <span className="block text-base font-semibold">iGOT AI Hub</span>
              <span className="hidden text-xs text-white/70 sm:block">
                Competency-driven Learning for a More Capable Civil Service
              </span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 xl:flex" aria-label="Primary">
            {["Learn", "Assess", "Grow", "Serve"].map((item) => (
              <span
                key={item}
                className="cursor-default rounded-md px-3 py-2 text-sm text-white/85 hover:bg-white/10"
              >
                {item}
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-white/60" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, competencies"
                aria-label="Search"
                className="focus-ring w-64 rounded-md bg-white/10 py-2 pl-8 pr-3 text-sm text-white placeholder:text-white/60"
              />
            </form>
            <button
              onClick={handleBellClick}
              className="focus-ring relative rounded-md p-2 hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
            </button>

            {/* Profile badge / dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md p-1 pl-2 hover:bg-white/10 focus-ring"
                aria-label="User profile menu"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-xs font-semibold">
                  {learner?.avatarInitials ?? "A"}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-medium">{learner?.name ?? "Ashraf"}</span>
                  <span className="block text-xs text-white/70">{learner?.role ?? "Under Secretary"}</span>
                </span>
              </button>

              {profileDropdownOpen ? (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-card p-1.5 shadow-lg text-foreground z-50"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="border-b border-border px-3 py-2">
                    <p className="text-xs font-semibold text-primary">{learner?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{learner?.email}</p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 rounded px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted"
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Profile & Settings
                  </Link>
                  <Link
                    to="/support"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 rounded px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted"
                  >
                    <LifeBuoy className="h-3.5 w-3.5 text-muted-foreground" />
                    Help & Support
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <Link
                    to="/login"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 rounded px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Switch Account / Sign Out
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="h-[3px] w-full bg-accent" />
      </header>

      <div className="mx-auto flex w-full max-w-[1500px]">
        <aside
          className={cn(
            "fixed inset-y-16 left-0 z-20 w-64 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar p-3 lg:sticky lg:top-[67px] lg:block lg:h-[calc(100vh-67px)]",
            open ? "block" : "hidden",
          )}
          aria-label="Sections"
        >
          <nav className="flex h-full flex-col">
            <div className="space-y-1">
              {mainNav.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  active={isActive(item.to)}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
            <div className="mt-auto space-y-1 border-t border-sidebar-border pt-3">
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

        <main className="flex min-w-0 flex-1 flex-col justify-between px-4 py-6 md:px-8">
          <div>{children}</div>
          <footer className="mt-12 border-t border-border pt-6 pb-6 text-xs text-muted-foreground">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">iGOT AI Hub</span>
                <span>•</span>
                <span>Capacity Building & Intelligent Competency Platform</span>
              </div>
              <p>© {new Date().getFullYear()} iGOT AI Hub. All rights reserved.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
