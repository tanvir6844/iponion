const fs = require('fs');
const path = require('path');

console.log("🚀 Updating Home, Admin, and Customer Portal for full Date/Time & Booking sync...");

// ==========================================
// 1. UPDATE app/page.tsx (Add Date/Time & Email Sync)
// ==========================================
const pageContent = `"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone, Clock, Wrench, Shield, User, MapPin, CheckCircle,
  AlertCircle, Star, ArrowRight, Check, Sparkles, MessageCircle,
  ChevronDown, Calendar, CheckCircle2, Mail
} from "lucide-react";
import IponionLogo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { auth, onAuthStateChanged } from "@/lib/firebase";

export default function Home() {
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("ওয়াইফাই ও নেটওয়ার্ক সেটআপ");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookingTime, setBookingTime] = useState("যেকোনো সময় (জরুরি)");
  const [area, setArea] = useState("");
  const [problem, setProblem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  // Auto-detect Firebase logged in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setCurrentUser(fbUser);
        if (fbUser.displayName) setName(fbUser.displayName);
        if (fbUser.email) setEmail(fbUser.email);
        if (fbUser.phoneNumber) setPhone(fbUser.phoneNumber);
      } else {
        const saved = localStorage.getItem("iponion_user");
        if (saved) {
          try {
            const u = JSON.parse(saved);
            setCurrentUser(u);
            if (u.name) setName(u.name);
            if (u.phone) setPhone(u.phone);
            if (u.email) setEmail(u.email);
          } catch (e) {}
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const normalizePhone = (num: string) => {
    let clean = (num || "").replace(/[^0-9]/g, "");
    if (clean.startsWith("880")) clean = clean.slice(2);
    if (!clean.startsWith("0") && clean.length === 10) clean = "0" + clean;
    return clean;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !area.trim()) {
      alert("অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা লিখুন।");
      return;
    }

    setIsSubmitting(true);
    const cleanPhone = normalizePhone(phone);
    const customerEmail = email.trim() || (currentUser?.email || "");

    // 1. Update user session locally
    const userSession = {
      name: name.trim(),
      phone: cleanPhone,
      email: customerEmail,
      role: "customer"
    };
    try {
      localStorage.setItem("iponion_user", JSON.stringify(userSession));
    } catch (e) {}

    // 2. Prepare payload
    const payload = {
      service_title: service,
      customer_name: name.trim(),
      customer_phone: cleanPhone,
      customer_email: customerEmail || null,
      customer_address: area.trim(),
      area: area.trim(),
      booking_date: bookingDate,
      booking_time: bookingTime,
      problem_desc: problem.trim() || "জরুরি হোম/অফিস সার্ভিস",
      status: "Pending",
      created_at: new Date().toISOString()
    };

    let savedBooking = null;

    // 3. Insert directly to Supabase
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([payload])
        .select();

      if (!error && data && data.length > 0) {
        savedBooking = data[0];
      }
    } catch (err) {
      console.warn("Supabase insert notice:", err);
    }

    if (!savedBooking) {
      savedBooking = {
        id: "bk_" + Date.now(),
        ...payload
      };
    }

    // 4. Save to localStorage for instant local zero-latency sync
    try {
      const existing = JSON.parse(localStorage.getItem("iponion_bookings") || "[]");
      existing.unshift(savedBooking);
      localStorage.setItem("iponion_bookings", JSON.stringify(existing));
    } catch (e) {}

    // 5. Send notification email via FormSubmit
    try {
      fetch("https://formsubmit.co/ajax/iponion.11@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: \`🚨 নতুন বুকিং: \${service} - \${name} (\${cleanPhone})\`,
          Service: service,
          Customer: name,
          Phone: cleanPhone,
          Email: customerEmail,
          Address: area,
          PreferredDate: bookingDate,
          PreferredTime: bookingTime,
          Problem: problem || "N/A"
        })
      }).catch(() => {});
    } catch (e) {}

    setIsSubmitting(false);
    setBookingSuccess(savedBooking);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. TOP PORTAL STRIP */}
      <div className="bg-[#1a0b33] text-white text-[11px] py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <Phone size={11} className="text-lime-400" />
              হটলাইন: <strong className="text-white font-mono">01991477412</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={11} className="text-blue-400" />
              টেলিফোন: <strong className="text-white font-mono">096116786</strong>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <Clock size={11} className="text-amber-400" /> ২৪/৭ অন-কল সাপোর্ট
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/engineer"
              className="bg-lime-400 hover:bg-lime-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all shadow-sm"
            >
              <Wrench size={10} /> ইঞ্জিনিয়ার
            </Link>

            <Link
              href="/admin"
              className="bg-white/15 hover:bg-white/25 text-white font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all"
            >
              <Shield size={10} /> অ্যাডমিন
            </Link>
          </div>
        </div>
      </div>

      {/* 2. NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <Link href="/"><IponionLogo size="md" /></Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <a href="#services" className="hover:text-violet-700 transition-colors">সার্ভিসসমূহ</a>
            <a href="#booking" className="hover:text-violet-700 transition-colors">বুকিং</a>
            <a href="#contact" className="hover:text-violet-700 transition-colors">যোগাযোগ ও ঠিকানা</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#5894FF]/10 text-[#2563eb] hover:bg-[#5894FF]/20 border border-[#5894FF]/30 rounded-xl transition-all"
            >
              <User size={14} />
              {currentUser ? "আমার পোর্টাল" : "কাস্টমার পোর্টাল"}
            </Link>

            <a
              href="#booking"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#F53E00] hover:bg-[#e03800] rounded-xl shadow-md transition-all"
            >
              জরুরি সার্ভিস নিন
            </a>
          </div>
        </div>
      </header>

      {/* 3. HERO */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-violet-50/60 via-white to-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F53E00]/10 text-[#F53E00] border border-[#F53E00]/20 mb-4">
            <Sparkles size={13} /> ঢাকা সিটির বিশ্বস্ত অন-ডিমান্ড টেকনিক্যাল সাপোর্ট
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#2D1457] tracking-tight leading-tight max-w-4xl mx-auto">
            বাসা ও অফিসের আইটি সমস্যায় <br />
            <span className="bg-gradient-to-r from-[#F53E00] via-[#5894FF] to-[#81B472] bg-clip-text text-transparent">
              ৩০ মিনিটেই এক্সপার্ট ইঞ্জিনিয়ার
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            রাউটার কনফিগারেশন, ওয়াইফাই কভারেজ, পিসি/ল্যাপটপ মেরামত কিংবা সিসিটিভি সল্যুশন—সব পাবেন এক ঠিকানায়।
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#booking"
              className="px-6 py-3.5 bg-[#F53E00] hover:bg-[#d93700] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all"
            >
              সার্ভিস বুক করুন <ArrowRight size={16} />
            </a>
            <a
              href="tel:01991477412"
              className="px-6 py-3.5 bg-[#2D1457] hover:bg-[#220e44] text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <Phone size={16} className="text-lime-400" /> 01991477412
            </a>
          </div>
        </div>
      </section>

      {/* 4. BOOKING FORM WITH DATE & TIME */}
      <section id="booking" className="py-12 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200">
            <div className="text-center mb-8">
              <span className="text-xs font-black uppercase tracking-wider text-[#5894FF] bg-[#5894FF]/10 px-3 py-1 rounded-full">
                ইনস্ট্যান্ট হোম/অফিস সার্ভিস
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2D1457] mt-2">
                অনলাইনে সার্ভিস রিকোয়েস্ট পাঠান
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                বুকিং সম্পন্ন হওয়ামাত্রই আপনার কাস্টমার পোর্টালে স্ট্যাটাস লাইভ দেখতে পাবেন
              </p>

              {currentUser && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  লগইন আছেন: <strong>{currentUser.displayName || currentUser.name || "Customer"}</strong> ({currentUser.email || currentUser.phone})
                </div>
              )}
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ফোন নম্বর *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল (পোর্টাল সিঙ্কের জন্য) *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm"
                  />
                </div>
              </div>

              {/* DATE & TIME ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div>
                  <label className="block text-xs font-bold text-[#2D1457] mb-1">সার্ভিস ক্যাটাগরি *</label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm bg-white"
                  >
                    <option value="ওয়াইফাই ও নেটওয়ার্ক সেটআপ">ওয়াইফাই ও নেটওয়ার্ক সেটআপ</option>
                    <option value="কম্পিউটার ও ল্যাপটপ রিপেয়ার">কম্পিউটার ও ল্যাপটপ রিপেয়ার</option>
                    <option value="সিসিটিভি ক্যামেরা ইনস্টলেশন">সিসিটিভি ক্যামেরা ইনস্টলেশন</option>
                    <option value="অফিস আইটি এএমসি ও সার্ভার">অফিস আইটি এএমসি ও সার্ভার</option>
                    <option value="অন্যান্য টেকনিক্যাল সমস্যা">অন্যান্য জরুরি সমস্যা</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D1457] mb-1">📅 সার্ভিস নেওয়ার তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D1457] mb-1">⏰ পছন্দের সময়সূচী *</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm bg-white"
                  >
                    <option value="যেকোনো সময় (জরুরি)">যেকোনো সময় (জরুরি / ৩০ মিনিট)</option>
                    <option value="সকাল ১০:০০ - দুপুর ০১:০০">সকাল ১০:০০ - দুপুর ০১:০০</option>
                    <option value="দুপুর ০২:০০ - বিকাল ০৫:০০">দুপুর ০২:০০ - বিকাল ০৫:০০</option>
                    <option value="সন্ধ্যা ০৬:০০ - রাত ০৯:০০">সন্ধ্যা ০৬:০০ - রাত ০৯:০০</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার এলাকা ও বিস্তারিত ঠিকানা *</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="যেমন: বসিলা গার্ডেন সিটি, রোড ৪, বাসা ২৭"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সমস্যার সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="যেমন: রাউটার পাওয়ার পাচ্ছে না..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#F53E00] to-[#e03800] text-white font-black text-base rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>বুকিং কনফার্ম হচ্ছে...</span>
                ) : (
                  <>
                    <span>কনফার্ম সার্ভিস বুকিং করুন</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 5. SUCCESS MODAL */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center border border-slate-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} />
            </div>
            <h3 className="text-2xl font-black text-[#2D1457]">বুকিং সফলভাবে সম্পন্ন হয়েছে!</h3>
            <p className="text-sm text-slate-600 mt-2">
              আপনার সার্ভিস রিকোয়েস্টটি গৃহীত হয়েছে। খুব দ্রুত আমাদের টেকনিক্যাল টিম যোগাযোগ করবে।
            </p>

            <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5 font-mono">
              <div><span className="text-slate-400">সার্ভিস:</span> <strong className="text-slate-800">{bookingSuccess.service_title}</strong></div>
              <div><span className="text-slate-400">তারিখ:</span> <strong className="text-blue-600">{bookingSuccess.booking_date}</strong></div>
              <div><span className="text-slate-400">সময়:</span> <strong className="text-blue-600">{bookingSuccess.booking_time}</strong></div>
              <div><span className="text-slate-400">নাম:</span> <strong className="text-slate-800">{bookingSuccess.customer_name}</strong></div>
              <div><span className="text-slate-400">ফোন:</span> <strong className="text-slate-800">{bookingSuccess.customer_phone}</strong></div>
              <div><span className="text-slate-400">স্ট্যাটাস:</span> <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Pending (অপেক্ষমান)</span></div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/portal"
                className="w-full py-3 bg-[#5894FF] hover:bg-[#437ee8] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>আমার পোর্টালে বুকিং ট্র্যাক করুন</span>
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => setBookingSuccess(null)}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#1a0b33] text-white py-8 border-t border-white/10 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <IponionLogo size="sm" />
          <p>© {new Date().getFullYear()} IPonion BD. 24/7 IT Support in Dhaka.</p>
          <div className="flex items-center gap-3">
            <Link href="/portal" className="text-slate-300 hover:text-white">কাস্টমার পোর্টাল</Link>
            <span>•</span>
            <Link href="/engineer" className="text-slate-300 hover:text-white">ইঞ্জিনিয়ার</Link>
            <span>•</span>
            <Link href="/admin" className="text-slate-300 hover:text-white">অ্যাডমিন</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
`;
fs.writeFileSync(path.join(__dirname, 'app', 'page.tsx'), pageContent, 'utf8');
console.log("✅ app/page.tsx updated with Date & Time picker!");

// ==========================================
// 2. UPDATE app/admin/page.tsx (Show Date, Time & CreatedAt)
// ==========================================
const adminContent = `"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, Phone, Clock, Calendar, CheckCircle2, AlertCircle, 
  Trash2, Edit, RefreshCw, UserCheck, Wrench, Search, MapPin, Mail, LogOut
} from "lucide-react";
import IponionLogo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Load Bookings
  const loadBookings = async () => {
    let supaList: any[] = [];
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        supaList = data;
      }
    } catch (e) {
      console.warn("Supabase load error:", e);
    }

    // Merge with localStorage
    let localList: any[] = [];
    try {
      const raw = localStorage.getItem("iponion_bookings");
      if (raw) localList = JSON.parse(raw);
    } catch (e) {}

    const merged = [...supaList];
    const seen = new Set(supaList.map((b) => String(b.id)));
    for (const lb of localList) {
      if (!seen.has(String(lb.id))) {
        merged.push(lb);
        seen.add(String(lb.id));
      }
    }

    setBookings(merged);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const savedPin = localStorage.getItem("iponion_admin_pin");
    if (savedPin === "1991" || savedPin === "1234") {
      setIsAuthenticated(true);
      loadBookings();
    } else {
      setLoading(false);
    }

    // Auto poll every 3 seconds for live dashboard updates
    const interval = setInterval(() => {
      if (localStorage.getItem("iponion_admin_pin") === "1991") {
        loadBookings();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1991" || pin === "1234") {
      localStorage.setItem("iponion_admin_pin", "1991");
      setIsAuthenticated(true);
      loadBookings();
    } else {
      alert("ভুল অ্যাডমিন পিন! অনুগ্রহ করে সঠিক পিন দিন।");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id);
    } catch (e) {}

    // Update local state
    setBookings((prev) =>
      prev.map((b) => (String(b.id) === String(id) ? { ...b, status: newStatus } : b))
    );
  };

  const handleAssignEngineer = async (id: string) => {
    const name = prompt("ইঞ্জিনিয়ারের নাম লিখুন:");
    if (!name) return;
    const phone = prompt("ইঞ্জিনিয়ারের ফোন নম্বর লিখুন:");

    try {
      await supabase
        .from("bookings")
        .update({
          assigned_engineer_name: name,
          assigned_engineer_phone: phone || "",
          status: "Assigned"
        })
        .eq("id", id);
    } catch (e) {}

    setBookings((prev) =>
      prev.map((b) =>
        String(b.id) === String(id)
          ? { ...b, assigned_engineer_name: name, assigned_engineer_phone: phone, status: "Assigned" }
          : b
      )
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই বুকিংটি ডিলিট করতে চান?")) return;
    try {
      await supabase.from("bookings").delete().eq("id", id);
    } catch (e) {}

    setBookings((prev) => prev.filter((b) => String(b.id) !== String(id)));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0b33] via-[#2D1457] to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
          <IponionLogo size="md" className="mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#2D1457]">সুপার অ্যাডমিন লগইন</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">নিরাপদ ড্যাশবোর্ডে প্রবেশ করতে সিকিউরিটি পিন দিন</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              autoFocus
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="পিন কোড লিখুন"
              className="w-full py-3 px-4 border border-slate-300 rounded-xl text-center font-mono text-xl tracking-widest focus:ring-2 focus:ring-[#5894FF] focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-3.5 bg-[#2D1457] hover:bg-[#3d1c75] text-white font-bold rounded-xl text-sm shadow-lg transition-all"
            >
              প্রবেশ করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filtered = bookings.filter((b) => {
    const matchSearch =
      (b.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.customer_phone || "").includes(search) ||
      (b.service_title || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/"><IponionLogo size="sm" /></Link>
            <span className="px-2.5 py-0.5 bg-violet-100 text-violet-900 rounded-full text-xs font-black">
              SUPER ADMIN
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setRefreshing(true); loadBookings(); }}
              className="p-2 text-slate-600 hover:text-[#5894FF] rounded-xl hover:bg-slate-100 transition-all"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin text-[#5894FF]" : ""} />
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("iponion_admin_pin");
                setIsAuthenticated(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all"
            >
              <LogOut size={13} />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#2D1457]">সার্ভিস বুকিং কন্ট্রোল প্যানেল</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              মোট বুকিং: <strong className="text-slate-800">{bookings.length} টি</strong> • প্রতি ৩ সেকেন্ডে অটো-সিঙ্ক হচ্ছে
            </p>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম, ফোন বা সার্ভিস দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#5894FF]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none"
            >
              <option value="All">সব স্ট্যাটাস</option>
              <option value="Pending">Pending (অপেক্ষমান)</option>
              <option value="Confirmed">Confirmed (নিশ্চিত)</option>
              <option value="Assigned">Assigned (ইঞ্জিনিয়ার নিযুক্ত)</option>
              <option value="Completed">Completed (সম্পন্ন)</option>
              <option value="Cancelled">Cancelled (বাতিল)</option>
            </select>
          </div>
        </div>

        {/* BOOKINGS TABLE / CARDS */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <p className="text-sm font-bold text-slate-600">কোনো বুকিং পাওয়া যায়নি।</p>
            </div>
          ) : (
            filtered.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-400">#{String(b.id).slice(0, 8)}</span>
                    <h3 className="text-base font-black text-[#2D1457]">{b.service_title}</h3>
                    
                    <select
                      value={b.status || "Pending"}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      className="text-xs font-bold px-2.5 py-1 rounded-full border border-slate-300 bg-slate-50 cursor-pointer focus:outline-none"
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Confirmed">✓ Confirmed</option>
                      <option value="Assigned">🔧 Assigned</option>
                      <option value="Completed">✅ Completed</option>
                      <option value="Cancelled">✕ Cancelled</option>
                    </select>
                  </div>

                  {/* CUSTOMER & DATE/TIME DETAILS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">গ্রাহকের তথ্য</span>
                      <strong className="text-slate-800 text-sm block">{b.customer_name}</strong>
                      <a href={\`tel:\${b.customer_phone}\`} className="font-mono text-[#5894FF] font-bold block">
                        📞 {b.customer_phone}
                      </a>
                      {b.customer_email && (
                        <span className="text-slate-500 font-mono text-[11px] block truncate">
                          ✉️ {b.customer_email}
                        </span>
                      )}
                    </div>

                    <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100">
                      <span className="text-blue-600 block text-[10px] uppercase font-black">📅 সার্ভিস নেওয়ার সময়সূচী</span>
                      <div className="mt-0.5">
                        <strong className="text-slate-900 block font-mono text-sm">
                          তারিখ: {b.booking_date || "তাৎক্ষণিক"}
                        </strong>
                        <span className="text-slate-600 block text-[11px] font-semibold">
                          সময়: {b.booking_time || "যেকোনো সময়"}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">📍 ঠিকানা ও সমস্যা</span>
                      <span className="text-slate-700 block truncate">{b.customer_address || b.area || "ঠিকানা দেওয়া হয়নি"}</span>
                      {b.problem_desc && (
                        <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1 italic">
                          "{b.problem_desc}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ASSIGNED ENGINEER INFO */}
                  {b.assigned_engineer_name && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                      <div>
                        <strong>দায়িত্বপ্রাপ্ত ইঞ্জিনিয়ার:</strong> {b.assigned_engineer_name}
                        {b.assigned_engineer_phone && <span className="font-mono ml-2">({b.assigned_engineer_phone})</span>}
                      </div>
                    </div>
                  )}

                  {/* CREATED TIMESTAMP */}
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock size={11} />
                    <span>বুকিং তৈরি: {b.created_at ? new Date(b.created_at).toLocaleString("bn-BD") : "N/A"}</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => handleAssignEngineer(b.id)}
                    className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1"
                  >
                    <Wrench size={12} />
                    <span>ইঞ্জিনিয়ার অ্যাসাইন</span>
                  </button>

                  <a
                    href={\`tel:\${b.customer_phone}\`}
                    className="p-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-xl text-xs font-bold"
                    title="কল দিন"
                  >
                    <Phone size={15} />
                  </a>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all"
                    title="ডিলিট করুন"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
`;
fs.writeFileSync(path.join(__dirname, 'app', 'admin', 'page.tsx'), adminContent, 'utf8');
console.log("✅ app/admin/page.tsx updated!");

// ==========================================
// 3. UPDATE app/portal/page.tsx (Customer Portal Date/Time & Full Sync)
// ==========================================
const portalContent = `"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Phone, Clock, Calendar, CheckCircle2, AlertCircle, Wrench,
  Star, LogOut, ArrowRight, RefreshCw, MessageCircle, MapPin
} from "lucide-react";
import IponionLogo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { auth, signOut, onAuthStateChanged } from "@/lib/firebase";

export default function CustomerPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const normalizePhone = (num: string) => {
    let clean = (num || "").replace(/[^0-9]/g, "");
    if (clean.startsWith("880")) clean = clean.slice(2);
    if (!clean.startsWith("0") && clean.length === 10) clean = "0" + clean;
    return clean;
  };

  const loadData = async (currentUser: any) => {
    const cleanPhone = normalizePhone(currentUser.phone || "");
    const last10 = cleanPhone.slice(-10);
    const userEmail = (currentUser.email || "").trim().toLowerCase();

    let supaList: any[] = [];
    try {
      const orList: string[] = [];
      if (last10) orList.push(\`customer_phone.ilike.%\${last10}%\`);
      if (userEmail) orList.push(\`customer_email.eq.\${userEmail}\`);

      if (orList.length > 0) {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .or(orList.join(","))
          .order("created_at", { ascending: false });

        if (!error && data) supaList = data;
      }
    } catch (e) {
      console.warn("Supabase query error:", e);
    }

    let localList: any[] = [];
    try {
      const raw = localStorage.getItem("iponion_bookings");
      if (raw) {
        const allLocal = JSON.parse(raw);
        if (Array.isArray(allLocal)) {
          localList = allLocal.filter((b: any) => {
            const bPhone = normalizePhone(b.customer_phone || b.phone || "");
            const bEmail = (b.customer_email || "").toLowerCase();
            return (last10 && bPhone.endsWith(last10)) || (userEmail && bEmail === userEmail);
          });
        }
      }
    } catch (e) {}

    const merged = [...supaList];
    const seen = new Set(supaList.map((b) => String(b.id)));
    for (const lb of localList) {
      if (!seen.has(String(lb.id))) {
        merged.push(lb);
        seen.add(String(lb.id));
      }
    }

    setBookings(merged);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // Also look up any saved phone
        let savedPhone = "";
        try {
          const s = localStorage.getItem("iponion_user");
          if (s) savedPhone = JSON.parse(s).phone || "";
        } catch (e) {}

        const u = {
          name: fbUser.displayName || "Customer",
          email: fbUser.email,
          phone: fbUser.phoneNumber || savedPhone || "",
          photoURL: fbUser.photoURL || "",
          role: "customer"
        };
        setUser(u);
        loadData(u);
      } else {
        const saved = localStorage.getItem("iponion_user");
        if (saved) {
          try {
            const u = JSON.parse(saved);
            setUser(u);
            loadData(u);
          } catch (e) {
            router.replace("/auth");
          }
        } else {
          router.replace("/auth");
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    if (confirm("আপনি কি নিশ্চিত আপনার পোর্টাল থেকে লগআউট করতে চান?")) {
      try {
        await signOut(auth);
        localStorage.removeItem("iponion_user");
      } catch (e) {}
      router.replace("/auth");
    }
  };

  const handleManualRefresh = () => {
    if (!user) return;
    setRefreshing(true);
    loadData(user);
  };

  const handleSaveReview = async () => {
    if (!selectedBookingForReview) return;
    try {
      await supabase
        .from("bookings")
        .update({
          customer_rating: rating,
          customer_review: reviewComment,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", selectedBookingForReview.id);
    } catch (e) {}

    setReviewSubmitted(true);
    setTimeout(() => {
      setSelectedBookingForReview(null);
      setReviewSubmitted(false);
      if (user) loadData(user);
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">⏳ অপেক্ষমান (Pending)</span>;
      case "Confirmed":
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">✓ বুকিং নিশ্চিত (Confirmed)</span>;
      case "Assigned":
      case "In Progress":
        return <span className="px-2.5 py-1 bg-violet-100 text-violet-800 rounded-full text-xs font-bold">🔧 ইঞ্জিনিয়ার নিয়োজিত</span>;
      case "Completed":
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">✅ কাজ সম্পন্ন হয়েছে</span>;
      case "Cancelled":
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">✕ বাতিল (Cancelled)</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <IponionLogo size="md" />
          <p className="mt-4 text-sm font-semibold text-slate-600 animate-pulse">
            কাস্টমার পোর্টাল লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/"><IponionLogo size="sm" /></Link>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800">{user?.name || "সম্মানিত কাস্টমার"}</div>
              <div className="text-[11px] font-mono text-slate-500">{user?.email || user?.phone}</div>
            </div>

            <button
              onClick={handleManualRefresh}
              title="রিফ্রেশ করুন"
              className="p-2 text-slate-600 hover:text-[#5894FF] hover:bg-slate-100 rounded-xl transition-all"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin text-[#5894FF]" : ""} />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all"
            >
              <LogOut size={13} />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-gradient-to-r from-[#2D1457] to-[#1a0b33] rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-lime-400 text-slate-950 font-black text-[11px] rounded-full uppercase">
              কাস্টমার ড্যাশবোর্ড
            </span>
            <h1 className="text-2xl font-black mt-2">
              স্বাগতম, {user?.name || "কাস্টমার"}!
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              ইমেইল: <strong className="font-mono text-lime-400">{user?.email || "N/A"}</strong> • আপনার সমস্ত সার্ভিস বুকিং ও লাইভ স্ট্যাটাস
            </p>
          </div>

          <Link
            href="/#booking"
            className="px-4 py-2.5 bg-[#F53E00] hover:bg-[#d93700] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
          >
            <span>নতুন সার্ভিস বুক করুন</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>আমার সার্ভিস বুকিং সমূহ</span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
                {bookings.length}
              </span>
            </h2>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wrench size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-700">এখনো কোনো সার্ভিস বুকিং করা হয়নি</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                আপনার বাসা বা অফিসের যেকোনো আইটি সমস্যার জন্য এখনই অনলাইন বুকিং করুন।
              </p>
              <Link
                href="/#booking"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#5894FF] hover:bg-[#437ee8] text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                <span>সার্ভিস বুক করুন</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-[#2D1457]">{b.service_title}</h3>
                      {getStatusBadge(b.status)}
                    </div>

                    {/* SCHEDULED DATE & TIME BADGE */}
                    <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="flex items-center gap-1 text-[#2D1457] font-bold">
                        <Calendar size={13} className="text-[#5894FF]" />
                        তারিখ: {b.booking_date || "তাৎক্ষণিক"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#2D1457] font-bold">
                        <Clock size={13} className="text-amber-500" />
                        সময়: {b.booking_time || "যেকোনো সময়"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 flex items-start gap-1.5">
                      <MapPin size={14} className="text-[#F53E00] shrink-0 mt-0.5" />
                      <span>{b.customer_address || b.area || "ঠিকানা সংরক্ষিত"}</span>
                    </div>

                    {b.problem_desc && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        সমস্যা: {b.problem_desc}
                      </p>
                    )}

                    {b.assigned_engineer_name && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                        <div>
                          <strong>দায়িত্বপ্রাপ্ত ইঞ্জিনিয়ার:</strong> {b.assigned_engineer_name}
                          {b.assigned_engineer_phone && (
                            <span className="font-mono ml-2">({b.assigned_engineer_phone})</span>
                          )}
                        </div>
                        {b.assigned_engineer_phone && (
                          <a
                            href={\`tel:\${b.assigned_engineer_phone}\`}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px]"
                          >
                            কল করুন
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {b.status === "Completed" && (
                      <button
                        onClick={() => {
                          setSelectedBookingForReview(b);
                          setRating(b.customer_rating || 5);
                          setReviewComment(b.customer_review || "");
                        }}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                      >
                        <Star size={14} fill="white" />
                        <span>{b.customer_rating ? "রিভিউ পরিবর্তন" : "⭐ রিভিউ দিন"}</span>
                      </button>
                    )}

                    <a
                      href="tel:01991477412"
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1"
                    >
                      <Phone size={13} />
                      <span>সাপোর্ট</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* REVIEW MODAL */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-xl font-black text-[#2D1457]">সার্ভিস রিভিউ ও মতামত</h3>
            <p className="text-xs text-slate-500 mt-1">
              আমাদের ইঞ্জিনিয়ারের কাজের মান কেমন লেগেছে রেটিং দিন:
            </p>

            {reviewSubmitted ? (
              <div className="my-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center font-bold text-sm">
                ধন্যবাদ! আপনার মূল্যবান মতামত সংরক্ষিত হয়েছে।
              </div>
            ) : (
              <div className="my-5 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">আপনার মূল্যবান মন্তব্য</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="কাজের মান ও ব্যবহার কেমন ছিল লিখুন..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveReview}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow"
                  >
                    রিভিউ সাবমিট করুন
                  </button>
                  <button
                    onClick={() => setSelectedBookingForReview(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync(path.join(__dirname, 'app', 'portal', 'page.tsx'), portalContent, 'utf8');
console.log("✅ app/portal/page.tsx updated!");

console.log("🎉 All synchronization files updated successfully!");
