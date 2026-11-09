const fs = require('fs');
const path = require('path');
const https = require('https');

const supabaseUrl = "https://rrdogwshgjxtxernujyq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZG9nd3NoZ2p4dHhlcm51anlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMzU4NzMsImV4cCI6MjEwNzkxMTg3M30.uz10bnSb-Zv9J5DhmzAk03cvG0daOvNnLh_vSifOpEA";

// 1. HARDCODE GENUINE KEY DIRECTLY (Prevents Vercel env overrides)
const supaCode = `import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "${supabaseUrl}",
  "${supabaseAnonKey}"
);
export default supabase;
`;

const libDir = path.join(__dirname, 'lib');
if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });
fs.writeFileSync(path.join(libDir, 'supabase.ts'), supaCode, 'utf8');

const supaSub = path.join(libDir, 'supabase');
if (!fs.existsSync(supaSub)) fs.mkdirSync(supaSub, { recursive: true });
fs.writeFileSync(path.join(supaSub, 'client.ts'), supaCode, 'utf8');
console.log("✅ lib/supabase.ts written with direct genuine credentials!");

// 2. TEST SUPABASE DATABASE CONNECTION VIA DIRECT REST API
const testUrl = new URL(supabaseUrl + "/rest/v1/bookings?select=*");
const options = {
  method: 'GET',
  headers: {
    'apikey': supabaseAnonKey,
    'Authorization': 'Bearer ' + supabaseAnonKey
  }
};

console.log("📡 Connecting to Supabase database...");
const req = https.request(testUrl, options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`📡 Supabase Server Status: ${res.statusCode} ${res.statusMessage}`);
    if (res.statusCode === 200) {
      const data = JSON.parse(body);
      console.log(`🎉 CONNECTION VERIFIED! Database currently has ${data.length} bookings.`);
      
      // 3. INSERT A LIVE TEST BOOKING DIRECTLY
      insertLiveBooking();
    } else {
      console.error("❌ Supabase returned error:", body);
    }
  });
});

req.on('error', (e) => console.error("❌ Network error:", e.message));
req.end();

function insertLiveBooking() {
  console.log("📥 Inserting a live test booking into Supabase...");
  const postUrl = new URL(supabaseUrl + "/rest/v1/bookings");
  const postReq = https.request(postUrl, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': 'Bearer ' + supabaseAnonKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  }, (res) => {
    let b = '';
    res.on('data', c => b += c);
    res.on('end', () => {
      console.log(`✅ Test booking status: ${res.statusCode}`);
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log("🎉 SUCCESS! Live test booking inserted into Supabase!");
        console.log("📋 Booking Data:", b);
      } else {
        console.error("Insert response:", b);
      }
    });
  });

  postReq.write(JSON.stringify([{
    service_title: "ওয়াইফাই ও নেটওয়ার্ক সেটআপ",
    customer_name: "তানভীর আহমেদ (টেস্ট কাস্টমার)",
    customer_phone: "01991477412",
    customer_email: "iponion.11@gmail.com",
    customer_address: "বাড়ি ২৭, রোড ৪, ব্লক ডি, বসিলা গার্ডেন সিটি, ঢাকা",
    area: "বসিলা",
    problem_desc: "[তারিখ: 2026-11-10 | সময়: সকাল ১০:০০ - দুপুর ০১:০০] টেস্ট বুকিং ভেরিফিকেশন",
    status: "Pending"
  }]));
  postReq.end();
}
