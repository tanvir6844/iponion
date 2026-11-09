import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://rrdogwshgjxtxernujyq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZG9nd3NoZ2p4dHhlcm51anlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMzU4NzMsImV4cCI6MjEwNzkxMTg3M30.uz10bnSb-Zv9J5DhmzAk03cvG0daOvNnLh_vSifOpEA"
);
export default supabase;
