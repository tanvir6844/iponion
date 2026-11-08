"use client";

import { useState, useEffect } from "react";
import IponionLogo from "@/components/Logo";
import { Phone, MessageCircle, MapPin, Zap, CheckCircle2, Globe, X, User, Shield, Star, Clock, Server, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [lang, setLang] = useState("bn");
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [area, setArea] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("iponion_lang");
      if (savedLang) setLang(savedLang);
    }
  }, []);

  const toggleLang = () => {
    const next = lang === "bn" ? "en" : "bn";
    setLang(next);
    localStorage.setItem("iponion_lang", next);
  };

  const t = {
    bn: {
      tag: "২৪/৭ অন-ডিমান্ড হোম ও অফিস আইটি সাপোর্ট",
      hero1: "স্মার্ট আইটি সলিউশন",
      hero2: "এর সাথে",
      heroDesc: "রাউটার, ওয়াইফাই, ল্যাপটপ, ডেস্কটপ, নেটওয়ার্কিং ক্যাবলিং ও সিসিটিভি ক্যামেরার যেকোনো জটিল সমস্যার দ্রুত ও নির্ভরযোগ্য ২৪/৭ সমাধান সমগ্র ঢাকা জুড়ে।",
      btnBook: "সার্ভিস বুক করুন",
      btnHotline: "কল দিন (২৪/৭)",
      btnWA: "WhatsApp চ্যাট",
      trust1: "✓ ২৪/৭ সেবা খোলা",
      trust2: "✓ সমগ্র ঢাকা হোম ভিজিট",
      trust3: "✓ ১০০% ডাটা সুরক্ষা",
      trust4: "✓ ক্যাশ অন কমপ্লিশন",
      techTitle: "আমরা যেসব শীর্ষ হার্ডওয়্যার ও নেটওয়ার্ক প্রযুক্তির সাথে কাজ করি",
      servicesTitle: "পেশাদার আইটি সমাধান",
      servicesSubtitle: "বাসাবাড়ি ও অফিসের জন্য প্রয়োজনীয় হার্ডওয়্যার, সফটওয়্যার ও এন্টারপ্রাইজ নেটওয়ার্কিং সেবা",
      priceFrom: "শুরু ৳",
      bookNow: "বুক করুন",
      formTitle: "আইটি সাপোর্ট সার্ভিস বুকিং ফর্ম",
      formDesc: "ফর্মটি পূরণ করুন। আমাদের সাপোর্ট টিম অবিলম্বে ফোনে আপনার সাথে যোগাযোগ করবে।",
      lblName: "আপনার পূর্ণ নাম *",
      lblPhone: "মোবাইল নম্বর *",
      lblService: "প্রয়োজনীয় সার্ভিস নির্বাচন করুন *",
      lblArea: "লোকেশন / এলাকা (সমগ্র ঢাকা) *",
      lblDesc: "সমস্যার সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)...",
      btnSubmit: "বুকিং কনফার্ম করুন",
      btnSubmitting: "বুকিং পাঠানো হচ্ছে...",
      modalTitle: "বুকিং সফলভাবে সম্পন্ন হয়েছে!",
      modalDesc: "ধন্যবাদ! আপনার সার্ভিস রিকোয়েস্ট সরাসরি IPonion সাপোর্ট টিম ও অ্যাডমিন প্যানেলে পৌঁছে গেছে। আমাদের ইঞ্জিনিয়ার দ্রুত আপনার সাথে যোগাযোগ করবে।",
      modalBtn: "ঠিক আছে",
      reviewsTitle: "সন্তুষ্ট গ্রাহকদের মতামত",
      reviewsSubtitle: "ঢাকা শহরের বাসা ও অফিস ক্লায়েন্টদের ১০০% খাঁটি অভিজ্ঞতা",
      contactTitle: "যোগাযোগ ও অফিস হাব",
      contactSubtitle: "যেকোনো জরুরি প্রয়োজনে ২৪/৭ কল দিন বা সরাসরি অফিসে চলে আসুন",
      addressLabel: "অফিস ঠিকানা:",
      addressText: "House: 27, Road: 04, Block: D, Bosila Garden City, Mohammadpur, Dhaka",
      phoneLabel: "হটলাইন ও WhatsApp (২৪/৭):",
      mapTitle: "গুগল ম্যাপ লোকেশন",
      footerRights: "সর্বস্বত্ব সংরক্ষিত। 24/7 Fast & Reliable IT Support across Dhaka. Hotline: 01991-477412",
      navPortal: "Customer Portal",
      navAdmin: "Admin",
      servicesList: [
        { id: "s1", title: "Wi-Fi ও রাউটার ট্রাবলশুটিং", price: 600, desc: "গতি কমে যাওয়া, ঘন ঘন ডিসকানেকশন ও ডুয়াল-ব্যান্ড সিকিউরিটি অপটিমাইজেশন।", icon: "📶" },
        { id: "s2", title: "হোম ও অফিস নেটওয়ার্ক সেটআপ", price: 1500, desc: "Cat6 ক্যাবলিং, গিগাবিট সুইচ, মাইক্রোটিক রাউটার কনফিগ ও ব্যান্ডউইথ ম্যানেজমেন্ট।", icon: "🖧" },
        { id: "s3", title: "ল্যাপটপ ও ডেস্কটপ মেরামত", price: 600, desc: "ফ্রিজিং, ব্লু-স্ক্রিন, নো-ডিসপ্লে, থার্মাল পেস্ট পরিবর্তন ও হার্ডওয়্যার ডায়াগনোসিস।", icon: "💻" },
        { id: "s4", title: "উইন্ডোজ, সফটওয়্যার ও প্রিন্টার সেটআপ", price: 1000, desc: "ক্লিন উইন্ডোজ ১০/১১, অফিস, নেটওয়ার্ক প্রিন্টার/স্ক্যানার সেটআপ ও ড্রাইভার ফিক্স।", icon: "🖨️" },
        { id: "s5", title: "সিসিটিভি ও আইপি ক্যামেরা সেটআপ", price: 1200, desc: "কমপ্লিট ক্যামেরা ইন্সটলেশন, ডিভিআর/এনভিআর কনফিগ ও ২৪/৭ মোবাইল লাইভ-ভিউ।", icon: "📹" },
        { id: "s6", title: "পিসি আপগ্রেড, এসএসডি/র‍্যাম ও ব্যাকআপ", price: 600, desc: "এসএসডি/র‍্যাম আপগ্রেড করে পুরনো পিসি ফাস্ট করা, ওএস ক্লোনিং ও ডাটা ব্যাকআপ।", icon: "⚡" },
        { id: "s7", title: "রিমোট অনলাইন আইটি সাপোর্ট", price: 500, desc: "অ্যানিডেস্কের মাধ্যমে তাৎক্ষণিক সফটওয়্যার ফিক্স, ইমেইল কনফিগ ও এরর সমাধান।", icon: "🌐" },
        { id: "s8", title: "মাসিক আইটি রক্ষণাবেক্ষণ (AMC)", price: 4000, desc: "অফিসের জন্য সার্বক্ষণিক নিয়মিত প্রিভেন্টিভ মেইনটেন্যান্স ও ইমার্জেন্সি সাপোর্ট।", icon: "🏢" }
      ],
      reviewsList: [
        { name: "আরিফুল ইসলাম", location: "মোহাম্মদপুর, ঢাকা", role: "বিজনেস ওনার", text: "আমাদের অফিসের ২০টি পিসির নেটওয়ার্কিং ও মাইক্রোটিক ব্যান্ডউইথ কনফিগারেশন খুব নিখুঁতভাবে করে দিয়েছেন। ইন্টারনেট স্পিড এখন একদম স্মুথ!", rating: 5 },
        { name: "সাবরিনা সুলতানা", location: "ধানমন্ডি, ঢাকা", role: "হোম ইউজার", text: "বাসার তিন তলায় ওয়াইফাই সিগন্যাল পেতাম না। IPonion টেকনিশিয়ান এসে ১ ঘণ্টার মধ্যে রাউটার অপটিমাইজ ও এক্সটেন্ডার বসিয়ে ফুল স্পিড করে দিয়েছেন।", rating: 5 },
        { name: "ইঞ্জি. তানভীর হাসান", location: "মিরপুর ডিওএইচএস", role: "সফটওয়্যার ডেভেলপার", text: "ল্যাপটপ হঠাৎ নীল স্ক্রিন হয়ে বন্ধ হয়ে যাচ্ছিল। বাসায় এসে থার্মাল পেস্ট পরিবর্তন ও উইন্ডোজ ক্লিন ইন্সটল করে দেন। খুব ভালো ও নিরাপদ সার্ভিস!", rating: 5 },
        { name: "রাশেদ চৌধুরী", location: "বসিলা গার্ডেন সিটি", role: "অফিস ম্যানেজার", text: "আমাদের নতুন অফিসের ৮টি সিসিটিভি ক্যামেরা ও মোবাইল লাইভ-ভিউ সেটআপ খুব যত্নসহকারে সম্পন্ন করেছেন। ২৪/৭ সাপোর্ট পাওয়া যায়!", rating: 5 }
      ]
    },
    en: {
      tag: "24/7 On-Demand Home & Office IT Support",
      hero1: "Smart IT & Network Solutions",
      hero2: "with",
      heroDesc: "Fast, reliable 24/7 troubleshooting for routers, Wi-Fi, laptops, desktops, network cabling, and CCTV cameras across whole Dhaka.",
      btnBook: "Book a Service",
      btnHotline: "Call (24/7)",
      btnWA: "WhatsApp Chat",
      trust1: "✓ 24/7 Available",
      trust2: "✓ Whole Dhaka Visits",
      trust3: "✓ 100% Data Privacy",
      trust4: "✓ Cash on Completion",
      techTitle: "Enterprise Hardware & Network Technologies We Support",
      servicesTitle: "Professional IT Solutions",
      servicesSubtitle: "Essential hardware, software, and networking support for homes and small offices",
      priceFrom: "From BDT ",
      bookNow: "Book",
      formTitle: "Book an IT Support Service",
      formDesc: "Fill in the form. Our support team will contact you immediately via phone.",
      lblName: "Your Full Name *",
      lblPhone: "Phone Number *",
      lblService: "Select Required Service *",
      lblArea: "Location / Area (Whole Dhaka) *",
      lblDesc: "Brief Description of Problem (Optional)...",
      btnSubmit: "Confirm Booking",
      btnSubmitting: "Submitting Booking...",
      modalTitle: "Booking Confirmed Successfully!",
      modalDesc: "Thank you! Your service request has been received by the IPonion support team. Our engineer will contact you shortly.",
      modalBtn: "Done / OK",
      reviewsTitle: "What Our Clients Say",
      reviewsSubtitle: "100% genuine feedback from homeowners and office businesses across Dhaka",
      contactTitle: "Contact & Office Hub",
      contactSubtitle: "Visit our office hub or call our 24/7 helpline anytime for instant support",
      addressLabel: "Office Address:",
      addressText: "House: 27, Road: 04, Block: D, Bosila Garden City, Mohammadpur, Dhaka",
      phoneLabel: "Hotline & WhatsApp (24/7):",
      mapTitle: "Google Maps Hub",
      footerRights: "All Rights Reserved. 24/7 Fast & Reliable IT Support across Dhaka. Hotline: 01991-477412",
      navPortal: "Customer Portal",
      navAdmin: "Admin",
      servicesList: [
        { id: "s1", title: "Wi-Fi & Router Troubleshooting", price: 600, desc: "Fix speed drops, frequent disconnections, dead zones, & dual-band security.", icon: "📶" },
        { id: "s2", title: "Home & Office Network Setup", price: 1500, desc: "Cat6 cabling, Gigabit switches, MikroTik router config & bandwidth control.", icon: "🖧" },
        { id: "s3", title: "Laptop & Desktop Repair/Support", price: 600, desc: "Fix freezing, blue screen crashes, thermal paste replacement & diagnosis.", icon: "💻" },
        { id: "s4", title: "Windows, Software & Printer Setup", price: 1000, desc: "Clean Windows 10/11 install, MS Office, network printer/scanner setup.", icon: "🖨️" },
        { id: "s5", title: "CCTV & IP Camera Setup", price: 1200, desc: "Complete CCTV & IP camera installation, DVR/NVR config & 24/7 mobile live-view.", icon: "📹" },
        { id: "s6", title: "PC Upgrades, SSD/RAM & Backup", price: 600, desc: "Speed up old machines with NVMe/SATA SSDs, RAM upgrade & OS cloning.", icon: "⚡" },
        { id: "s7", title: "Remote Online IT Support", price: 500, desc: "Instant online help anywhere in Bangladesh via AnyDesk for quick fixes.", icon: "🌐" },
        { id: "s8", title: "Monthly IT Maintenance (AMC)", price: 4000, desc: "Complete maintenance contract for small offices: routine checks & priority SLA.", icon: "🏢" }
      ],
      reviewsList: [
        { name: "Ariful Islam", location: "Mohammadpur, Dhaka", role: "Business Owner", text: "Configured structured cabling and MikroTik bandwidth management for 20 office PCs. Internet connection has been rock solid since then!", rating: 5 },
        { name: "Sabrina Sultana", location: "Dhanmondi, Dhaka", role: "Home Client", text: "Had zero Wi-Fi signal on the 3rd floor. IPonion technician arrived within an hour, optimized the router and installed an extender. Highly recommended!", rating: 5 },
        { name: "Engr. Tanvir Hasan", location: "Mirpur DOHS", role: "Software Engineer", text: "My laptop suffered sudden blue-screen freezes. The engineer serviced the thermal paste and clean-installed OS at home. Very professional and safe.", rating: 5 },
        { name: "Rashed Chowdhury", location: "Bosila Garden City", role: "Office Manager", text: "Installed 8 HD CCTV cameras and configured 24/7 mobile live-view access with great care. Outstanding 24/7 technical support!", rating: 5 }
      ]
    }
  };

  const curr = t[lang];

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          phone,
          service_title: selectedService,
          area,
          problem_desc: desc
        })
      });

      const data = await res.json();
      if (data.success) {
        setBookingData({ name, phone, service: selectedService, area });
        setShowModal(true);
        setName("");
        setPhone("");
        setSelectedService("");
        setArea("");
        setDesc("");
      } else {
        alert("Error: " + (data.error || "Failed to submit booking"));
      }
    } catch (err) {
      alert("Submission error! Please check your network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative selection:bg-[#FF6B57] selection:text-white">
      {/* Dynamic Background Mesh & Tech Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-200/30 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-orange-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-10 w-[550px] h-[550px] bg-emerald-100/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-95 transition">
            <IponionLogo size={40} />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 hover:border-[#2D1457] text-xs font-bold text-slate-700 hover:text-[#2D1457] bg-white transition shadow-sm"
              title="Toggle Language"
            >
              <Globe size={14} className="text-[#FF6B57]" />
              <span>{lang === "bn" ? "English" : "বাংলা"}</span>
            </button>

            <Link
              href="/portal"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-50 text-[#2D1457] font-bold text-xs hover:bg-violet-100 transition"
            >
              <User size={14} /> <span className="hidden sm:inline">{curr.navPortal}</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-semibold"
            >
              <Shield size={14} /> <span className="hidden sm:inline">{curr.navAdmin}</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-[#FF6B57] font-extrabold text-xs uppercase tracking-wide border border-orange-200 shadow-sm">
            <Zap size={14} className="fill-[#FF6B57]" /> {curr.tag}
          </div>

          <h1 className="mt-5 text-4xl sm:text-6xl font-black text-[#2D1457] tracking-tight leading-tight">
            {curr.hero1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D1457] via-[#FF6B57] to-[#FF8A65]">
              IPonion
            </span> {curr.hero2}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {curr.heroDesc}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
            <a href="#booking" className="px-7 py-3.5 rounded-xl bg-[#2D1457] text-white font-bold hover:bg-[#3D1A75] shadow-xl shadow-violet-950/20 transition transform hover:-translate-y-0.5">
              {curr.btnBook}
            </a>
            <a href="https://wa.me/8801991477412?text=Hello%20IPonion,%20I%20need%20IT%20Support." target="_blank" className="px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#20bd5a] shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2 transition transform hover:-translate-y-0.5">
              <MessageCircle size={18} /> {curr.btnWA}
            </a>
            <a href="tel:01991477412" className="px-6 py-3.5 rounded-xl border-2 border-slate-300 font-bold hover:bg-white inline-flex items-center gap-2 text-slate-800 transition">
              <Phone size={18} /> 01991-477412
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-600">
            <div>{curr.trust1}</div>
            <div>{curr.trust2}</div>
            <div>{curr.trust3}</div>
            <div>{curr.trust4}</div>
          </div>
        </div>
      </section>

      {/* Enterprise Tech Partners / Vendor Logos */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{curr.techTitle}</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 font-black text-slate-400 text-lg sm:text-xl tracking-wider select-none">
            <span className="hover:text-[#2D1457] transition">CISCO</span>
            <span className="hover:text-[#FF6B57] transition">MIKROTIK</span>
            <span className="hover:text-[#2D1457] transition">JUNIPER</span>
            <span className="hover:text-[#2563eb] transition">TP-LINK</span>
            <span className="hover:text-[#0096D6] transition">HP</span>
            <span className="hover:text-[#2D1457] transition">UBIQUITI</span>
            <span className="hover:text-[#ef4444] transition">HIKVISION</span>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative z-10 max-w-7xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B57]">IPonion Solutions</span>
          <h2 className="text-3xl font-black text-[#2D1457] mt-1">{curr.servicesTitle}</h2>
          <p className="text-slate-600 text-sm mt-1">{curr.servicesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {curr.servicesList.map((s) => (
            <div key={s.id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-violet-300 hover:shadow-xl transition flex flex-col justify-between group">
              <div>
                <div className="text-3xl mb-4 w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition">{s.icon}</div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-3">{s.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-500">
                  {curr.priceFrom}<span className="text-base font-black text-[#2D1457]">{s.price.toLocaleString()}+</span>
                </div>
                <a href="#booking" onClick={() => setSelectedService(s.title)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF6B57]/10 text-[#FF6B57] hover:bg-[#FF6B57] hover:text-white transition">
                  {curr.bookNow}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking" className="relative z-10 max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D1457] mb-2">{curr.formTitle}</h2>
          <p className="text-sm text-slate-500 mb-8">{curr.formDesc}</p>

          <form onSubmit={handleBooking} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder={curr.lblName} className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#2D1457]" />
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={curr.lblPhone} className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#2D1457]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select required value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm bg-white outline-none focus:border-[#2D1457]">
                <option value="">{curr.lblService}</option>
                {curr.servicesList.map((s) => (
                  <option key={s.id} value={s.title}>{s.title} ({curr.priceFrom}{s.price})</option>
                ))}
              </select>
              <input type="text" required value={area} onChange={(e) => setArea(e.target.value)} placeholder={curr.lblArea} className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#2D1457]" />
            </div>
            <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={curr.lblDesc} className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#2D1457]" />
            <button type="submit" disabled={submitting} className="w-full py-4 rounded-xl bg-[#2D1457] text-white font-bold text-base hover:bg-[#3D1A75] transition shadow-lg shadow-violet-950/20 disabled:opacity-50">
              {submitting ? curr.btnSubmitting : curr.btnSubmit}
            </button>
          </form>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="relative z-10 max-w-7xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B57]">Client Testimonials</span>
          <h2 className="text-3xl font-black text-[#2D1457] mt-1">{curr.reviewsTitle}</h2>
          <p className="text-slate-600 text-sm mt-1">{curr.reviewsSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {curr.reviewsList.map((rev, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-3">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} size={15} className="fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed mb-4">"{rev.text}"</p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <h4 className="font-extrabold text-sm text-[#2D1457]">{rev.name}</h4>
                <p className="text-xs text-slate-500">{rev.role} • 📍 {rev.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Real Office Map Section */}
      <section className="relative z-10 max-w-7xl mx-auto py-12 px-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <span className="text-xs font-black uppercase text-[#FF6B57] tracking-wider">Get in Touch</span>
                <h3 className="text-2xl font-black text-[#2D1457] mt-1">{curr.contactTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">{curr.contactSubtitle}</p>
              </div>

              <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-100 space-y-2">
                <div className="text-xs font-bold text-[#FF6B57] flex items-center gap-1.5">
                  <MapPin size={15} /> {curr.addressLabel}
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">{curr.addressText}</p>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-100 space-y-2">
                <div className="text-xs font-bold text-[#FF6B57] flex items-center gap-1.5">
                  <Phone size={15} /> {curr.phoneLabel}
                </div>
                <a href="tel:01991477412" className="block text-lg font-black text-[#2D1457] hover:underline">01991-477412</a>
                <a href="https://wa.me/8801991477412" target="_blank" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline">
                  <MessageCircle size={14} /> WhatsApp: +880 1991-477412
                </a>
              </div>
            </div>

            {/* Embedded User Map */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d280.84051789958835!2d90.34059921039857!3d23.75385838069246!3m2!1i1024!2i768!4f13.1!2m1!1shouse%2027%20Road%2004%20block%3A-%20D%20Bosila%20garden%20city%20Mohammadpur%20Dhaka!5e1!3m2!1sen!2sbd!4v1794165134399!5m2!1sen!2sbd"
                width="100%"
                height="340"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/8801991477412?text=Hello%20IPonion,%20I%20need%20IT%20Support."
        target="_blank"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition flex items-center gap-2 font-bold text-sm"
        title="WhatsApp Chat"
      >
        <MessageCircle size={24} />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Footer */}
      <footer className="relative z-10 bg-[#1C0D36] text-slate-400 py-10 px-4 text-center text-xs border-t border-violet-950">
        &copy; 2026 IPonion. {curr.footerRights}
      </footer>

      {/* POPUP MODAL ON BOOKING SUCCESS */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-[#2D1457] mb-2">{curr.modalTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">{curr.modalDesc}</p>
            {bookingData && (
              <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-1 mb-6 border border-slate-200">
                <div><strong>Service:</strong> {bookingData.service}</div>
                <div><strong>Name:</strong> {bookingData.name} ({bookingData.phone})</div>
                <div><strong>Location:</strong> {bookingData.area}</div>
              </div>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-[#2D1457] text-white font-bold text-sm rounded-xl hover:bg-[#3D1A75] transition shadow-md shadow-violet-950/20"
            >
              {curr.modalBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}