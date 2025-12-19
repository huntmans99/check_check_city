import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("✓ Supabase initialized successfully");
  } else {
    console.warn("❌ Supabase credentials missing");
    console.warn("URL:", supabaseUrl ? "✓ Present" : "✗ Missing");
    console.warn("Key:", supabaseAnonKey ? "✓ Present" : "✗ Missing");
  }
} catch (error) {
  console.warn("Failed to initialize Supabase:", error);
}

export { supabase };
