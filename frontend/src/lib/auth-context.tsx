import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/**
 * Profile data collected during sign-up, stored in the Supabase `profiles` table.
 */
export interface SignUpProfileData {
  name: string;
  role?: string;
  department: string;
  cadre: string;
}

export interface AuthContextValue {
  /** Supabase session — null when unauthenticated or in demo mode */
  session: Session | null;
  /** Supabase user — null when unauthenticated or in demo mode */
  user: User | null;
  /** True while the initial auth state is being resolved from storage */
  isLoading: boolean;
  /** True when the user clicked "Continue as Demo Civil Servant" */
  isDemoMode: boolean;

  /** Sign in with Supabase email + password */
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Sign up with Supabase, then insert a profile row */
  signUp: (
    email: string,
    password: string,
    profileData: SignUpProfileData,
  ) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  /** Sign out from Supabase */
  signOut: () => Promise<void>;
  /** Activate demo mode (bypasses Supabase auth, uses localStorage) */
  activateDemoMode: () => void;
  /** Deactivate demo mode */
  deactivateDemoMode: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_MODE_KEY = "igot_demo_mode";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DEMO_MODE_KEY) === "true";
  });

  useEffect(() => {
    // Resolve initial session from Supabase storage
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    // Subscribe to auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      // If a real session arrives, clear demo mode
      if (newSession) {
        setIsDemoMode(false);
        localStorage.removeItem(DEMO_MODE_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
    // Deactivate demo mode on real login
    setIsDemoMode(false);
    localStorage.removeItem(DEMO_MODE_KEY);
    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    profileData: SignUpProfileData,
  ): Promise<{ error: string | null; needsEmailConfirmation?: boolean }> => {
    const options: {
      emailRedirectTo?: string;
      data: {
        full_name: string;
        role: string;
        department: string;
        cadre: string;
      };
    } = {
      data: {
        full_name: profileData.name,
        role: profileData.role || "Under Secretary",
        department: profileData.department,
        cadre: profileData.cadre,
      },
    };

    if (typeof window !== "undefined") {
      options.emailRedirectTo = window.location.origin;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      // Insert the civil servant profile row immediately after auth user creation
      const avatarInitials = profileData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name: profileData.name,
        role: profileData.role ?? "Under Secretary",
        department: profileData.department,
        cadre: profileData.cadre,
        avatar_initials: avatarInitials,
      });

      if (profileError) {
        console.error("Profile creation failed:", profileError.message);
        // Auth user exists but profile insert failed — not a blocking error for demo
      }
    }

    const needsEmailConfirmation = !data.session;

    setIsDemoMode(false);
    localStorage.removeItem(DEMO_MODE_KEY);
    return { error: null, needsEmailConfirmation };
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setIsDemoMode(false);
    // Clear all mock/demo localStorage keys so previous user data
    // never bleeds into the next authenticated user's view.
    if (typeof window !== "undefined") {
      const MOCK_KEYS = [
        "igot_courses_v2",
        "igot_competencies_v2",
        "igot_learner_v2",
        "igot_assessment_results_v2",
        "igot_reassessment_v2",
        DEMO_MODE_KEY,
      ];
      MOCK_KEYS.forEach((k) => localStorage.removeItem(k));
    }
  };

  const activateDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem(DEMO_MODE_KEY, "true");
  };

  const deactivateDemoMode = () => {
    setIsDemoMode(false);
    localStorage.removeItem(DEMO_MODE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        activateDemoMode,
        deactivateDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the auth context from any component.
 * Must be used within an <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

/**
 * Returns true when the user is considered authenticated:
 * either they have a real Supabase session or demo mode is active.
 */
export function useIsAuthenticated(): boolean {
  const { session, isDemoMode, isLoading } = useAuth();
  if (isLoading) return true; // Treat as authenticated while resolving to avoid flicker
  return Boolean(session) || isDemoMode;
}
