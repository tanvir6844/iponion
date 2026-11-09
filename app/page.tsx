"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone, Clock, Wrench, Shield, User, MapPin, CheckCircle,
  AlertCircle, Star, ArrowRight, Check, Sparkles, MessageCircle,
  ChevronDown, Calendar, CheckCircle2, Mail, Wifi, Laptop, Video,
  Cpu, Server, Headphones, Award, ThumbsUp, Zap
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
  const [bookingTime, setBookingTime] = useState("যেকোনো সময় (জরুরি / ৩০ মিনিট)");
  const [area, setArea] = useState("");
  const [problem, setProblem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  const toggleLang = (l: "bn" | "en") => setLang(l);

  // Detect logged in user (Firebase + LocalStorage)
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

    // 1. Save user session locally
    const userSession = {
      name: name.trim(),
      phone: cleanPhone,
      email: customerEmail,
      role: "customer"
    };
    try {
      localStorage.setItem("iponion_user", JSON.stringify(userSession));
    } catch (e) {}

    // 2. Prepare safe description with date & time embedded
    const scheduleInfo = `[তারিখ: ${bookingDate} | সময়: ${bookingTime}${customerEmail ? ` | ইমেইল: ${customerEmail}` : ""}]`;
    const fullProblem = problem.trim() ? `${scheduleInfo} ${problem.trim()}` : scheduleInfo;

    const basePayload = {
      service_title: service,
      customer_name: name.trim(),
      customer_phone: cleanPhone,
      customer_email: customerEmail || null,
      customer_address: area.trim(),
      area: area.trim(),
      problem_desc: fullProblem,
      status: "Pending"
    };

    let savedBooking: any = null;

    // 3. Multi-tier insert into Supabase
    try {
      // First try with booking_date & booking_time
      const res1 = await supabase.from("bookings").insert([{
        ...basePayload,
        booking_date: bookingDate,
        booking_time: bookingTime
      }]).select();

      if (!res1.error && res1.data && res1.data.length > 0) {
        savedBooking = res1.data[0];
      } else {
        // Fallback to core columns that always exist
        const res2 = await supabase.from("bookings").insert([basePayload]).select();
        if (res2.data && res2.data.length > 0) {
          savedBooking = res2.data[0];
        }
      }
    } catch (err) {
      console.warn("Supabase insert notice:", err);
    }

    if (!savedBooking) {
      savedBooking = {
        id: "bk_" + Date.now(),
        ...basePayload,
        booking_date: bookingDate,
        booking_time: bookingTime,
        created_at: new Date().toISOString()
      };
    }

    // 4. Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("iponion_bookings") || "[]");
      existing.unshift(savedBooking);
      localStorage.setItem("iponion_bookings", JSON.stringify(existing));
    } catch (e) {}

    // 5. Send Email Alert via FormSubmit
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

  const services = [
    {
      id: "wifi",
      title: lang === "bn" ? "ওয়াইফাই ও নেটওয়ার্ক সেটআপ" : "WiFi & Networking Setup",
      desc: lang === "bn" ? "রাউটার, MikroTik কনফিগারেশন, মেস ওয়াইফাই এবং অফিস ল্যান কেবলিং।" : "Router setup, MikroTik configuration, Mesh WiFi & LAN cabling.",
      icon: <Wifi className="w-8 h-8 text-[#5894FF]" />,
      badge: lang === "bn" ? "সর্বাধিক জনপ্রিয়" : "Most Popular",
      price: lang === "bn" ? "৳৪৯৯ থেকে শুরু" : "From ৳499"
    },
    {
      id: "pc",
      title: lang === "bn" ? "কম্পিউটার ও ল্যাপটপ রিপেয়ার" : "PC & Laptop Repair",
      desc: lang === "bn" ? "উইন্ডোজ ইনস্টলেশন, স্লো পিসি স্পিড-আপ, হার্ডওয়্যার রিপ্লেস ও ডাটা রিকভারি।" : "OS setup, speed-up, SSD/RAM upgrade, virus cleaning & data recovery.",
      icon: <Laptop className="w-8 h-8 text-[#F53E00]" />,
      badge: lang === "bn" ? "দ্রুত সার্ভিস" : "Fast Service",
      price: lang === "bn" ? "৳৫৯৯ থেকে শুরু" : "From ৳599"
    },
    {
      id: "cctv",
      title: lang === "bn" ? "সিসিটিভি ক্যামেরা ইনস্টলেশন" : "CCTV Camera Installation",
      desc: lang === "bn" ? "আইপি ও এইচডি ক্যামেরা সেটআপ, মোবাইল লাইভ ভিউ এবং ডিভিআর কনফিগারেশন।" : "IP/HD camera setup, NVR/DVR setup & mobile live monitoring.",
      icon: <Video className="w-8 h-8 text-[#81B472]" />,
      badge: lang === "bn" ? "নিরাপত্তা সমাধান" : "Security",
      price: lang === "bn" ? "৳৭৯৯ থেকে শুরু" : "From ৳799"
    },
    {
      id: "amc",
      title: lang === "bn" ? "অফিস আইটি এএমসি ও সার্ভার" : "Office IT AMC & Server",
      desc: lang === "bn" ? "অফিসের আইটি সাপোর্ট, ফাইল সার্ভার এবং বাৎসরিক মেইনটেন্যান্স কন্ট্রাক্ট।" : "Dedicated IT maintenance contract, file servers & corporate support.",
      icon: <Server className="w-8 h-8 text-violet-600]" />,
      badge: lang === "bn" ? "কর্পোরেট প্যাকেজ" : "Corporate",
      price: lang === "bn" ? "আলোচনা সাপেক্ষে" : "Custom Quote"
    },
    {
      id: "hardware",
      title: lang === "bn" ? "হার্ডওয়্যার ও এক্সেসরিজ" : "Hardware & Sales Support",
      desc: lang === "bn" ? "নতুন পিসি বিল্ড, রাউটার, সুইচ, পাওয়ার সাপ্লাই ও ক্যাবল সরাসরি ডেলিভারি।" : "Custom PC build, genuine routers, switches & replacement components.",
      icon: <Cpu className="w-8 h-8 text-amber-500" />,
      badge: lang === "bn" ? "অরিজিনাল পার্টস" : "Genuine",
      price: lang === "bn" ? "মার্কেট প্রাইস" : "Market Price"
    },
    {
      id: "emergency",
      title: lang === "bn" ? "২৪/৭ অন-কল ইমার্জেন্সি সাপোর্ট" : "24/7 On-Call Support",
      desc: lang === "bn" ? "জরুরি ইন্টারনেট বা সিস্টেম ডাউন হলে তাৎক্ষণিক অন-সাইট ইঞ্জিনিয়ার ভিজিট।" : "Emergency response for critical business & home IT downtime.",
      icon: <Headphones className="w-8 h-8 text-rose-500" />,
      badge: lang === "bn" ? "২৪ ঘণ্টা অন-কল" : "24/7 Support",
      price: lang === "bn" ? "জরুরি সেবা" : "Urgent Service"
    }
  ];

  const technologies = [
    "MikroTik", "Cisco", "TP-Link", "Hikvision", "Dahua", 
    "Dell", "HP", "Lenovo", "Windows", "Ubiquiti", "D-Link", "Asus"
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. TOP PORTAL ACCESS STRIP */}
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
              <Wrench size={10} /> ইঞ্জিনিয়ার লগইন
            </Link>

            <Link
              href="/admin"
              className="bg-white/15 hover:bg-white/25 text-white font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all"
            >
              <Shield size={10} /> অ্যাডমিন
            </Link>

            <span className="text-white/20">|</span>

            <div className="flex items-center bg-black/30 rounded-full p-0.5">
              <button
                onClick={() => toggleLang("bn")}
                className={`px-2 py-0.5 rounded-full font-bold transition-all ${lang === "bn" ? "bg-white text-slate-900" : "text-slate-300"}`}
              >
                বাং
              </button>
              <button
                onClick={() => toggleLang("en")}
                className={`px-2 py-0.5 rounded-full font-bold transition-all ${lang === "en" ? "bg-white text-slate-900" : "text-slate-300"}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <Link href="/"><IponionLogo size="md" /></Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <a href="#services" className="hover:text-violet-700 transition-colors">{lang === "bn" ? "সার্ভিসসমূহ" : "Services"}</a>
            <a href="#why-us" className="hover:text-violet-700 transition-colors">{lang === "bn" ? "কেন আমরা?" : "Why Us"}</a>
            <a href="#technologies" className="hover:text-violet-700 transition-colors">{lang === "bn" ? "প্রযুক্তি পার্টনার" : "Technologies"}</a>
            <a href="#booking" className="hover:text-violet-700 transition-colors">{lang === "bn" ? "বুকিং" : "Book Service"}</a>
            <a href="#contact" className="hover:text-violet-700 transition-colors">{lang === "bn" ? "যোগাযোগ ও ঠিকানা" : "Contact & Map"}</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#5894FF]/10 text-[#2563eb] hover:bg-[#5894FF]/20 border border-[#5894FF]/30 rounded-xl transition-all"
            >
              <User size={14} />
              {currentUser ? (lang === "bn" ? "আমার পোর্টাল" : "My Portal") : (lang === "bn" ? "কাস্টমার পোর্টাল" : "Customer Portal")}
            </Link>

            <a
              href="#booking"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#F53E00] hover:bg-[#e03800] rounded-xl shadow-md transition-all"
            >
              {lang === "bn" ? "জরুরি সার্ভিস নিন" : "Get Support Now"}
            </a>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-violet-50/60 via-white to-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F53E00]/10 text-[#F53E00] border border-[#F53E00]/20 mb-4">
            <Sparkles size={13} /> {lang === "bn" ? "ঢাকা সিটির বিশ্বস্ত অন-ডিমান্ড টেকনিক্যাল সাপোর্ট পার্টনার" : "Dhaka's #1 On-Demand IT Support"}
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#2D1457] tracking-tight leading-tight max-w-4xl mx-auto">
            {lang === "bn" ? "বাসা ও অফিসের আইটি সমস্যায়" : "Home & Office IT Problems?"} <br />
            <span className="bg-gradient-to-r from-[#F53E00] via-[#5894FF] to-[#81B472] bg-clip-text text-transparent">
              {lang === "bn" ? "৩০ মিনিটেই এক্সপার্ট ইঞ্জিনিয়ার" : "Certified Engineer in 30 Mins"}
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {lang === "bn"
              ? "ওয়াইফাই ড্রপ, রাউটার সমস্যা, স্লো পিসি/ল্যাপটপ কিংবা সিসিটিভি ক্যামেরা অফলাইন? আমাদের দক্ষ টিম পৌঁছে যাবে আপনার ঠিকানায়।"
              : "Router drop, slow PC, WiFi dead zones or CCTV offline? Our certified engineers reach your doorstep in 30 minutes."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#booking"
              className="px-6 py-3.5 bg-[#F53E00] hover:bg-[#d93700] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all"
            >
              {lang === "bn" ? "সার্ভিস বুক করুন" : "Book Service Now"} <ArrowRight size={16} />
            </a>
            <a
              href="tel:01991477412"
              className="px-6 py-3.5 bg-[#2D1457] hover:bg-[#220e44] text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <Phone size={16} className="text-lime-400" /> 01991477412
            </a>
          </div>

          {/* STATS BAR */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-[#F53E00]">৩০ মিনিট</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">গড় অন-সাইট রেসপন্স</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-[#5894FF]">১০০%</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">সমাধান নিশ্চয়তা</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-[#81B472]">৫০০+</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">সন্তুষ্ট গ্রাহক ও অফিস</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-[#2D1457]">২৪/৭</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">অন-কল সাপোর্ট</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SERVICES SECTION */}
      <section id="services" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-[#5894FF] bg-[#5894FF]/10 px-3 py-1 rounded-full">
              আমাদের সার্ভিসসমূহ
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2D1457] mt-3">
              যে কোনো আইটি জটিলতায় বিশ্বস্ত সমাধান
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              বাসা, দোকান কিংবা করপোরেট অফিস—আপনার প্রয়োজনে দক্ষ টেকনিক্যাল টিম প্রস্তুত
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div
                key={s.id}
                className="bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#5894FF]/40 hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                      {s.icon}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-violet-100 text-[#2D1457] rounded-full">
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 group-hover:text-[#2D1457] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{s.price}</span>
                  <a
                    href="#booking"
                    onClick={() => setService(s.title)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#F53E00] hover:text-[#d93700]"
                  >
                    বুক করুন <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section id="why-us" className="py-16 bg-slate-100/60 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-[#81B472] bg-[#81B472]/15 px-3 py-1 rounded-full text-emerald-800">
              কেন আইপিওনিয়ন?
            </span>
            <h2 className="text-3xl font-black text-[#2D1457] mt-3">
              অন্যদের চেয়ে আমরা কেন এগিয়ে?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-orange-100 text-[#F53E00] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-900">৩০ মিনিটে আগমন</h4>
              <p className="text-xs text-slate-500 mt-1.5">জরুরি প্রয়োজনে ঢাকার প্রধান এলাকাগুলোতে আধা ঘণ্টার মধ্যেই উপস্থিতি।</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 text-[#5894FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-900">সার্টিফাইড ইঞ্জিনিয়ার</h4>
              <p className="text-xs text-slate-500 mt-1.5">MikroTik, CCNA ও হার্ডওয়্যার সার্টিফাইড দক্ষ প্রফেশনালস।</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-emerald-100 text-[#81B472] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ThumbsUp size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-900">ফিক্সড ও স্পষ্ট চার্জ</h4>
              <p className="text-xs text-slate-500 mt-1.5">কোনো লুকানো চার্জ নেই। কাজ শুরুর আগেই চার্জ চূড়ান্ত করা হয়।</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 text-[#2D1457] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-900">কাস্টমার পোর্টাল ও ওয়ারেন্টি</h4>
              <p className="text-xs text-slate-500 mt-1.5">লাইভ ট্র্যাকিং, অনলাইন রিভিউ ও সার্ভিসের নিশ্চয়তা।</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SUPPORTED BRANDS & TECHNOLOGIES */}
      <section id="technologies" className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            যেসব ব্র্যান্ড ও টেকনোলজিতে আমরা পারদর্শী
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {technologies.map((t, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition-all"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BOOKING SECTION WITH DATE & TIME */}
      <section id="booking" className="py-16 bg-slate-100/70 border-t border-slate-200">
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
                    <option value="যেকোনো সময় (জরুরি / ৩০ মিনিট)">যেকোনো সময় (জরুরি / ৩০ মিনিট)</option>
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
                  placeholder="যেমন: রাউটারে রেড লাইট জ্বলছে, নেটওয়ার্ক পাচ্ছি না..."
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

      {/* 8. SUCCESS MODAL */}
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

      {/* 9. CONTACT & GOOGLE MAP */}
      <section id="contact" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#F53E00] bg-[#F53E00]/10 px-3 py-1 rounded-full">
                অফিস ও সার্ভিস কভারেজ
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2D1457] mt-2">
                সরাসরি আমাদের হেড অফিসে আসুন
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <MapPin size={18} className="text-[#F53E00] shrink-0 mt-0.5" />
                  <span><strong>ঠিকানা:</strong> বাড়ি: ২৭, রোড: ০৪, ব্লক: ডি, বসিলা গার্ডেন সিটি, মোহাম্মদপুর, ঢাকা</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={18} className="text-[#5894FF] shrink-0" />
                  <span><strong>মোবাইল ও হোয়াটসঅ্যাপ:</strong> 01991477412</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={18} className="text-[#81B472] shrink-0" />
                  <span><strong>আইপি টেলিফোন:</strong> 096116786</span>
                </div>
              </div>
            </div>

            <div className="w-full h-[320px] sm:h-[380px] rounded-3xl overflow-hidden border border-slate-300 shadow-md">
              <iframe
                title="IPonion Office Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.285871261327!2d90.34444531543168!3d23.73719899520445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bf0000000001%3A0x6b5e0c52bbdfb598!2sBosila%20Garden%20City!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 10. FULL FOOTER */}
      <footer className="bg-[#1a0b33] text-white py-12 border-t border-white/10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
            <div className="space-y-3">
              <IponionLogo size="sm" />
              <p className="text-slate-400 text-xs">
                ঢাকা সিটিতে বাসা ও অফিসের জন্য ২৪/৭ দ্রুততম অন-ডিমান্ড আইটি ও নেটওয়ার্ক সাপোর্ট।
              </p>
            </div>
            <div>
              <h5 className="font-bold text-white mb-2 text-sm">সার্ভিস লিংক</h5>
              <ul className="space-y-1.5 text-slate-300">
                <li><a href="#services" className="hover:text-white">ওয়াইফাই নেটওয়ার্ক সেটআপ</a></li>
                <li><a href="#services" className="hover:text-white">পিসি ও ল্যাপটপ রিপেয়ার</a></li>
                <li><a href="#services" className="hover:text-white">সিসিটিভি ক্যামেরা সল্যুশন</a></li>
                <li><a href="#services" className="hover:text-white">অফিস আইটি এএমসি</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-2 text-sm">ডেডিকেটেড পোর্টাল</h5>
              <ul className="space-y-1.5 text-slate-300">
                <li><Link href="/portal" className="hover:text-white">কাস্টমার পোর্টাল</Link></li>
                <li><Link href="/engineer" className="hover:text-white">ফিল্ড ইঞ্জিনিয়ার পোর্টাল</Link></li>
                <li><Link href="/admin" className="hover:text-white">অ্যাডমিন ড্যাশবোর্ড</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-2 text-sm">জরুরি যোগাযোগ</h5>
              <div className="space-y-1 text-slate-300 font-mono">
                <p>হটলাইন: 01991477412</p>
                <p>টেলিফোন: 096116786</p>
                <p className="text-[11px] font-sans text-slate-400">বসিলা গার্ডেন সিটি, মোহাম্মদপুর, ঢাকা</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
            <p>© {new Date().getFullYear()} IPonion BD. All Rights Reserved.</p>
            <p className="text-slate-500">Fast & Reliable IT Support in Dhaka City.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
