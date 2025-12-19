"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SupabaseTest() {
  const [status, setStatus] = useState("Testing...");

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Environment Variables:");
        console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log("Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Present" : "✗ Missing");
        console.log("Supabase client:", supabase);

        if (!supabase) {
          setStatus("❌ Supabase client is null - environment variables not loaded");
          return;
        }

        const { data, error } = await supabase.from("users").select("id").limit(1);
        
        if (error) {
          setStatus(`❌ Error: ${error.message}`);
        } else {
          setStatus(`✓ Connected! Users table found. Record count: ${data?.length || 0}`);
        }
      } catch (e: any) {
        setStatus(`❌ Exception: ${e.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Supabase Connection Test</h1>
      <p style={{ fontSize: 16 }}>{status}</p>
      <p style={{ marginTop: 24, color: "#666" }}>
        Check browser console (F12) for detailed logs
      </p>
    </div>
  );
}
