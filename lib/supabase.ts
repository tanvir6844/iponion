import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rrdogwshgjxtxernujyq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZG9nd3NoZ2p4dHhlcm51anlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzQxNjMsImV4cCI6MjA1NjgwOTE2M30.4i4k3H_e5L0-3d_zKqD5q-jP4q4q4q4q4q4q4q4q4q4";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
