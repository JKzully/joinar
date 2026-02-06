import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client with service role key.
// Bypasses RLS — only use in server actions for admin tasks like email lookups.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
