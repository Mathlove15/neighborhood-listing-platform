import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createSupabaseServer(token?: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase connection settings.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: token
        ? { Authorization: "Bearer " + token }
        : {},
    },
  });
}