"use client";
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
          _subject: `🚨 নতুন বুকিং: ${service} - ${name} (${cleanPhone})`,
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
