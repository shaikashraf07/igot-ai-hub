import { createClient } from "@supabase/supabase-js";

const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : (typeof process !== "undefined" ? process.env : {});
const envUrl = (env["VITE_SUPABASE_URL"] as string | undefined)?.trim();
const envKey = (env["VITE_SUPABASE_ANON_KEY"] as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(envUrl && envKey);

if (!isSupabaseConfigured) {
  console.warn(
    "Missing Supabase environment variables. " +
      "Application running in fallback/demo mode. " +
      "To connect live database, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local",
  );
}

/**
 * Supabase client singleton.
 * Uses the anon/public key only — never the service-role secret key.
 * If credentials are not configured, uses placeholder strings to prevent initialization crash
 * while enabling demo/mock mode to function completely.
 */
export const supabase = createClient(
  envUrl || "https://placeholder-project.supabase.co",
  envKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
