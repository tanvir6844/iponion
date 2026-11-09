import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rrdogwshgjxtxernujyq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_aaLOziCwzzDqYUnVEbDiXw_jmj5lJbd";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
