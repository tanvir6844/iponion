const fs = require('fs');
const path = require('path');

// 1. app/engineer/page.tsx (Dedicated Engineer Login & Assigned Task Dashboard)
const engineerPage = `"use client";

import { useState, useEffect } from "react";
import IponionLogo from "@/components/Logo";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, Calendar, CheckCircle2, Wrench, Shield, ArrowRight, Check, LogOut, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const DEFAULT_ENGINEERS = [
  { name: "Tanvir Ahmed", phone: "01991477412", pin: "1991" },
  { name: "Rahim Islam", phone: "01711000001", pin: "1234" },
  { name: "Kamal Hossain", phone: "01811000002", pin: "1234" },
  { name: "Sabbir Hossain", phone: "01911000003", pin: "1234" }
];

export default function EngineerPortal() {
  const [engineer, setEngineer] = useState<any>(null);
  const [selectedEngName, setSelectedEngName] = useState(DEFAULT_ENGINEERS[0].name);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Check persistent login on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("iponion_engineer_session");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setEngineer(parsed);
          fetchAssignedTasks(parsed.name);
        } catch (e) {}
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const target = DEFAULT_ENGINEERS.find(eng => eng.name === selectedEngName);
    if (!target) {
      setLoginError("ইঞ্জিনিয়ার পাওয়া যায়নি।");
      return;
    }

    if (pin === target.pin || pin === "1991" || pin === "1234") {
      setEngineer(target);
      localStorage.setItem("iponion_engineer_session", JSON.stringify(target));
      fetchAssignedTasks(target.name);
    } else {
      setLoginError("ভুল পিন কোড! সঠিক পিন দিন (ডিফল্ট: 1234 অথবা 1991)");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("iponion_engineer_session");
    setEngineer(null);
    setPin("");
  };

  const fetchAssignedTasks = async (engName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("engineer_name", engName)
        .order("created_at", { ascending: false });

      if (data) {
        setBookings(data);
      } else {
        const local = localStorage.getItem("iponion_bookings");
        if (local) {
          const all = JSON.parse(local);
          setBookings(all.filter((b: any) => b.engineer_name === engName));
        }
      }
    } catch (err) {
      console.error(err);
      const local = localStorage.getItem("iponion_bookings");
      if (local) {
        const all = JSON.parse(local);
        setBookings(all.filter((b: any) => b.engineer_name === engName));
      }
    } finally {
      setLoading(false);
    }
  };

  // Status Updater (In Progress / Completed)
  const updateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      await supabase.from("bookings").update({
        status: newStatus,
        completed_at: newStatus === "Completed" ? new Date().toISOString() : null
      }).eq("id", bookingId);

      // Local update
      const updated = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
      setBookings(updated);

      // Global bookings sync
      const globalLocal = localStorage.getItem("iponion_bookings");
      if (globalLocal) {
        const parsed = JSON.parse(globalLocal);
        const nextAll = parsed.map((b: any) => b.id === bookingId ? { ...b, status: newStatus } : b);
        localStorage.setItem("iponion_bookings", JSON.stringify(nextAll));
      }

      alert(newStatus === "Completed" ? "🎉 কাজ সফলভাবে সম্পন্ন হিসেবে মার্ক হয়েছে! কাস্টমার এখন রিভিউ দিতে পারবেন।" : "🚀 কাজের স্ট্যাটাস 'In Progress' আপডেট হয়েছে।");
    } catch (err) {
      console.error(err);
      alert("আপডেট করার সময় সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter tasks
  const activeTasks = bookings.filter(b => b.status !== "Completed" && b.status !== "সম্পন্ন");
  const completedTasks = bookings.filter(b => b.status === "Completed" || b.status === "সম্পন্ন");
  const displayedTasks = tab === "active" ? activeTasks : completedTasks;

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      {/* Top Header */}
      <header className="bg-[#2D1457] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><IponionLogo size="sm" /></Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-lime-400 text-slate-950 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Wrench size={13} /> ইঞ্জিনিয়ার পোর্টাল
            </span>
            {engineer && (
              <button onClick={handleLogout} className="text-xs text-rose-300 hover:text-white flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <LogOut size={13} /> লগআউট
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* LOGIN FORM IF NOT LOGGED IN */}
        {!engineer ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center">
            <div className="w-16 h-16 bg-violet-100 text-[#2D1457] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wrench size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">ফিল্ড ইঞ্জিনিয়ার লগইন</h1>
            <p className="text-xs text-slate-500 mt-1 mb-6">আপনার অ্যাসাইন করা কাজের বিবরণ দেখতে লগইন করুন</p>

            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 font-semibold flex items-center gap-2">
                <AlertCircle size={15} /> {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ইঞ্জিনিয়ার নির্বাচন করুন:</label>
                <select
                  value={selectedEngName}
                  onChange={(e) => setSelectedEngName(e.target.value)}
                  className="w-full text-sm font-semibold p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:outline-none bg-slate-50"
                >
                  {DEFAULT_ENGINEERS.map(eng => (
                    <option key={eng.name} value={eng.name}>{eng.name} ({eng.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সিকিউরিটি পিন কোড:</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="৪ ডিজিট পিন দিন (যেমন: 1234 বা 1991)"
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#2D1457] hover:bg-[#3d1c75] text-white font-bold rounded-xl shadow-lg transition-all text-sm mt-2 flex items-center justify-center gap-2"
              >
                লগইন করুন <ArrowRight size={16} />
              </button>
            </form>
          </div>
        ) : (
          /* LOGGED IN ENGINEER DASHBOARD */
          <div>
            {/* Engineer Profile Card & Stats */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">অন-ডিউটি টেকনিশিয়ান</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">{engineer.name}</h2>
                  <p className="text-xs text-slate-500 font-mono">{engineer.phone}</p>
                </div>
                <button
                  onClick={() => fetchAssignedTasks(engineer.name)}
                  className="self-start sm:self-auto text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg border border-violet-200 flex items-center gap-1"
                >
                  ↻ রিফ্রেশ টাস্ক
                </button>
              </div>

              {/* Task Counts Summary */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-500 font-medium">মোট কাজ</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{bookings.length}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl text-center border border-amber-200">
                  <p className="text-xs text-amber-800 font-medium">চলমান / অপেক্ষমান</p>
                  <p className="text-xl font-black text-amber-700 mt-0.5">{activeTasks.length}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl text-center border border-emerald-200">
                  <p className="text-xs text-emerald-800 font-medium">সম্পন্ন হয়েছে</p>
                  <p className="text-xl font-black text-emerald-700 mt-0.5">{completedTasks.length}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 mb-5 max-w-sm">
              <button
                onClick={() => setTab("active")}
                className={\`flex-1 py-2 text-xs font-bold rounded-xl transition-all \${
                  tab === "active" ? "bg-[#2D1457] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }\`}
              >
                চলমান কাজ ({activeTasks.length})
              </button>
              <button
                onClick={() => setTab("completed")}
                className={\`flex-1 py-2 text-xs font-bold rounded-xl transition-all \${
                  tab === "completed" ? "bg-[#2D1457] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }\`}
              >
                সম্পন্ন কাজ ({completedTasks.length})
              </button>
            </div>

            {/* Tasks Cards */}
            <div className="space-y-4">
              {displayedTasks.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-slate-500 border border-slate-200">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
                  <p className="font-bold text-slate-800">কোনো {tab === "active" ? "চলমান" : "সম্পন্ন"} কাজ নেই</p>
                  <p className="text-xs text-slate-400 mt-0.5">নতুন কোনো টাস্ক অ্যাসাইন হলে এখানে দেখতে পাবেন।</p>
                </div>
              ) : (
                displayedTasks.map((b) => {
                  const isCompleted = b.status === "Completed" || b.status === "সম্পন্ন";
                  const cleanPhone = (b.customer_phone || "").replace(/^0/, "");

                  return (
                    <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="text-[11px] font-bold text-violet-700 bg-violet-100 px-2.5 py-0.5 rounded-md">
                            {b.service_title}
                          </span>
                          <h3 className="text-lg font-black text-slate-900 mt-1">{b.customer_name}</h3>
                        </div>
                        <span className={\`text-xs font-bold px-3 py-1 rounded-full \${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                        }\`}>
                          {isCompleted ? "✅ Completed" : "⚙️ In Progress"}
                        </span>
                      </div>

                      {/* Address & Note Box */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 mb-4 text-xs">
                        <div className="flex items-start gap-2">
                          <MapPin size={15} className="text-rose-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900">লোকেশন:</span>
                            <p className="text-slate-700">{b.customer_address || b.area || "Mohammadpur, Dhaka"}</p>
                          </div>
                        </div>

                        {b.problem_desc && (
                          <div className="pt-2 border-t border-slate-200/70 text-slate-700">
                            <span className="font-bold text-slate-900">কাস্টমারের সমস্যা:</span> &quot;{b.problem_desc}&quot;
                          </div>
                        )}
                      </div>

                      {/* Quick Communication Actions */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <a
                          href={\`tel:\${b.customer_phone}\`}
                          className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200"
                        >
                          <Phone size={14} className="text-emerald-600" /> কল দিন
                        </a>
                        <a
                          href={\`https://wa.me/880\${cleanPhone}\`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-[#25D366]/30"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                        <a
                          href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(b.customer_address || b.area || "Dhaka")}\`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-sky-200"
                        >
                          <MapPin size={14} className="text-sky-600" /> ম্যাপ
                        </a>
                      </div>

                      {/* On-site Actions */}
                      <div className="pt-3 border-t border-slate-100">
                        {isCompleted ? (
                          <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 border border-emerald-200">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            কাজটি সফলভাবে সম্পন্ন হয়েছে (Done)
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {b.status !== "In Progress" && (
                              <button
                                onClick={() => updateStatus(b.id, "In Progress")}
                                disabled={updatingId === b.id}
                                className="w-1/3 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                              >
                                🚀 কাজ শুরু
                              </button>
                            )}
                            <button
                              onClick={() => updateStatus(b.id, "Completed")}
                              disabled={updatingId === b.id}
                              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all"
                            >
                              <Check size={16} /> ✅ কাজ সম্পন্ন হয়েছে (Mark as Done)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
`;

// 2. app/auth/page.tsx (Unified Portal Hub for Customer, Engineer, Admin)
const authPage = `"use client";

import { useState } from "react";
import IponionLogo from "@/components/Logo";
import Link from "next/link";
import { User, Wrench, Shield, ArrowRight, Phone, Mail } from "lucide-react";

export default function AuthPage() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    const user = {
      name: name || "সম্মানিত গ্রাহক",
      phone: phone,
      email: email || \`\${phone}@customer.iponion.com\`
    };

    localStorage.setItem("iponion_user", JSON.stringify(user));
    window.location.href = "/portal";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block"><IponionLogo size="lg" /></Link>
        <h2 className="mt-4 text-2xl font-black text-slate-900">আইপিওনিয়ন পোর্টাল</h2>
        <p className="mt-1 text-xs text-slate-500">আপনার প্রয়োজন অনুযায়ী সঠিক পোর্টালে প্রবেশ করুন</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        {/* Customer Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-violet-100 text-[#2D1457] flex items-center justify-center font-bold">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">কাস্টমার পোর্টাল লগইন</h3>
              <p className="text-[11px] text-slate-500">আপনার চলমান ও পূর্বের বুকিং দেখতে</p>
            </div>
          </div>

          <form onSubmit={handleCustomerLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">আপনার নাম (ঐচ্ছিক):</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: তানভীর আহমেদ"
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর (বাধ্যতামূলক):</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                required
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2D1457] hover:bg-[#3d1c75] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              কাস্টমার ড্যাশবোর্ডে প্রবেশ করুন <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Other Portals Switcher */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/engineer"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-violet-600 shadow-sm transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center font-bold flex-shrink-0">
              <Wrench size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 group-hover:text-violet-700">ইঞ্জিনিয়ার</p>
              <p className="text-[10px] text-slate-400">ফিল্ড টাস্ক</p>
            </div>
          </Link>

          <Link
            href="/admin"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-violet-600 shadow-sm transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 group-hover:text-violet-700">অ্যাডমিন</p>
              <p className="text-[10px] text-slate-400">কন্ট্রোল প্যানেল</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
`;

// 3. Update app/page.tsx with the Standard Map iframe and Navigation Links
let homePagePath = path.join(__dirname, 'app/page.tsx');
if (fs.existsSync(homePagePath)) {
  let homeContent = fs.readFileSync(homePagePath, 'utf8');

  // Replace map iframe with standard size container and updated user iframe
  const mapRegex = /<iframe[^>]*src="https:\/\/www\.google\.com\/maps\/embed\?[^"]*"[^>]*><\/iframe>/i;
  const newStandardMap = \`<div className="w-full h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d383.8500617922683!2d90.34048948775155!3d23.75387596635493!3m2!1i1024!2i768!4f13.1!2m1!1shouse%2027%20Road%2004%20block%3A-%20D%20Bosila%20garden%20city%20Mohammadpur%20Dhaka!5e0!3m2!1sen!2sbd!4v1794166645987!5m2!1sen!2sbd"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                ></iframe>
              </div>\`;

  if (mapRegex.test(homeContent)) {
    homeContent = homeContent.replace(mapRegex, newStandardMap);
  }

  // Ensure footer has Engineer Portal link
  if (!homeContent.includes('href="/engineer"')) {
    homeContent = homeContent.replace(
      'href="/admin"',
      'href="/engineer" className="text-slate-400 hover:text-white transition-colors">ইঞ্জিনিয়ার পোর্টাল</Link>\\n              <span className="text-slate-600">•</span>\\n              <Link href="/admin"'
    );
  }

  fs.writeFileSync(homePagePath, homeContent, 'utf8');
  console.log('✓ app/page.tsx updated with standard map & navigation');
}

// Write the files
fs.mkdirSync(path.join(__dirname, 'app/engineer'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'app/engineer/page.tsx'), engineerPage, 'utf8');
console.log('✓ app/engineer/page.tsx written');

fs.writeFileSync(path.join(__dirname, 'app/auth/page.tsx'), authPage, 'utf8');
console.log('✓ app/auth/page.tsx written');

console.log('\\nAll updates completed cleanly without BOM!');
