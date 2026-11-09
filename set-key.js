const fs = require('fs');
const path = require('path');

console.log("🚀 Updating Supabase files with genuine key...");

const supabaseUrl = "https://rrdogwshgjxtxernujyq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZG9nd3NoZ2p4dHhlcm51anlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMzU4NzMsImV4cCI6MjEwNzkxMTg3M30.uz10bnSb-Zv9J5DhmzAk03cvG0daOvNnLh_vSifOpEA";

const supaCode = `import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "${supabaseUrl}";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "${supabaseAnonKey}";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
`;

// 1. Write lib/supabase.ts
const libDir = path.join(__dirname, 'lib');
if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });
fs.writeFileSync(path.join(libDir, 'supabase.ts'), supaCode, 'utf8');

// 2. Write lib/supabase/client.ts
const supaSub = path.join(libDir, 'supabase');
if (!fs.existsSync(supaSub)) fs.mkdirSync(supaSub, { recursive: true });
fs.writeFileSync(path.join(supaSub, 'client.ts'), supaCode, 'utf8');

// 3. Write .env.local
const envContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}\n`;
fs.writeFileSync(path.join(__dirname, '.env.local'), envContent, 'utf8');

console.log("✅ All Supabase files written successfully with genuine key!");
