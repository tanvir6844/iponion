"use client";

import { useState, useEffect } from "react";
import IponionLogo from "@/components/Logo";
import { Phone, MessageCircle, MapPin, Zap, CheckCircle2, Globe, X, User, Shield, Star, Clock, Server, ArrowRight, ShieldCheck, Cpu, Activity, Award } from "lucide-react";
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
      badge: "২৪/৭ অন-ডিমান্ড হোম ও অফিস আইটি সাপোর্ট",
      heroTitle1: "স্মার্ট আইটি সলিউশন",
      heroTitle2: "এর সাথে",
      heroDesc: "রাউটার, ওয়াইফাই অপটিমাইজেশন, ল্যাপটপ, ডেস্কটপ, নেটওয়ার্ক ক্যাবলিং ও সিসিটিভি ক্যামেরার যেকোনো জটিল সমস্যার দ্রুত ও নির্ভরযোগ্য ২৪/৭ সমাধান সমগ্র ঢাকা জুড়ে।",
      btnBook: "সার্ভিস বুক করুন",
      btnHotline: "হটলাইন কল (২৪/৭)",
      btnWA: "WhatsApp চ্যাট",
      stat1Num: "১,০০০+",
      stat1Txt: "সফল হোম ও অফিস সাপোর্ট",
      stat2Num: "২৪/৭",
      stat2Txt: "সার্বক্ষণিক জরুরি সেবা",
      stat3Num: "৫০+",
      stat3Txt: "মাসিক AMC ক্লায়েন্ট",
      stat4Num: "১০০%",
      stat4Txt: "সমগ্র ঢাকায় হোম ডেলিভারি",
      servicesTag: "আমাদের সেবাসমূহ",
      servicesTitle: "পেশাদার আইটি সমাধান",
      servicesSubtitle: "বাসাবাড়ি ও অফিসের জন্য প্রয়োজনীয় হার্ডওয়্যার, সফটওয়্যার ও এন্টারপ্রাইজ নেটওয়ার্কিং সেবা",
      priceFrom: "শুরু ৳",
      bookNow: "বুক করুন",
      formTag: "অনলাইন সার্ভিস বুকিং",
      formTitle: "আইটি সাপোর্ট সার্ভিস বুকিং ফর্ম",
      formDesc: "ফর্মটি পূরণ করুন। আমাদের সাপোর্ট টিম অবিলম্বে ফোনে আপনার সাথে যোগাযোগ করবে।",
      lblName: "আপনার পূর্ণ নাম *",
      lblPhone: "মোবাইল নম্বর *",
      lblService: "প্রয়োজনীয় সার্ভিস নির্বাচন করুন *",
      lblArea: "লোকেশন / এলাকা (সমগ্র ঢাকা) *",
      lblDesc: "সমস্যার বিবরণ (ঐচ্ছিক)...",
      btnSubmit: "বুকিং কনফার্ম করুন",
      btnSubmitting: "বুকিং প্রসেসিং হচ্ছে...",
      modalTitle: "বুকিং সফলভাবে সম্পন্ন হয়েছে!",
      modalDesc: "ধন্যবাদ! আপনার সার্ভিস রিকোয়েস্ট সরাসরি IPonion সাপোর্ট টিম ও অ্যাডমিন প্যানেলে পৌঁছে গেছে। আমাদের ইঞ্জিনিয়ার দ্রুত আপনার সাথে ফোনে যোগাযোগ করবে।",
      modalBtn: "ঠিক আছে",
      reviewsTag: "ক্লায়েন্ট রিভিউ",
      reviewsTitle: "সন্তুষ্ট গ্রাহকদের অভিজ্ঞতা",
      reviewsSubtitle: "ঢাকা শহরের বাসা ও অফিস ক্লায়েন্টদের ১০০% খাঁটি মতামত",
      worksWithTag: "Hardware & Network Technology",
      worksWithTitle: "যেসব শীর্ষ প্রযুক্তির সাথে আমরা কাজ করি",
      worksWithSubtitle: "আন্তর্জাতিক মানের এন্টারপ্রাইজ হার্ডওয়্যার ও রাউটিং প্রযুক্তি দিয়ে আমরা সাপোর্ট প্রদান করি",
      contactTag: "যোগাযোগ ও হাব",
      contactTitle: "অফিস ঠিকানা ও লোকেশন",
      contactSubtitle: "যেকোনো জরুরি প্রয়োজনে ২৪/৭ সরাসরি অফিসে চলে আসুন বা হটলাইনে কল দিন",
      addressLabel: "অফিস হাব:",
      addressText: "House: 27, Road: 04, Block: D, Bosila Garden City, Mohammadpur, Dhaka",
      hotlineLabel: "২৪/৭ সাপোর্ট হটলাইন:",
      waLabel: "সরাসরি WhatsApp চ্যাট:",
      footerRights: "সর্বস্বত্ব সংরক্ষিত। 24/7 IT Support across Dhaka. Hotline: 01991-477412",
      navPortal: "Customer Portal",
      navAdmin: "Admin",
      servicesList: [
        { id: "s1", title: "Wi-Fi ও রাউটার ট্রাবলশুটিং", price: 600, desc: "গতি কমে যাওয়া, ঘন ঘন ডিসকানেকশন ও ডুয়াল-ব্যান্ড সিকিউরিটি অপটিমাইজেশন।", icon: "📶" },
        { id: "s2", title: "হোম ও অফিস নেটওয়ার্ক সেটআপ", price: 1500, desc: "Cat6 ক্যাবলিং, গিগাবিট সুইচ, মাইক্রোটিক কনফিগ ও ব্যান্ডউইথ ম্যানেজমেন্ট।", icon: "🖧" },
        { id: "s3", title: "ল্যাপটপ ও ডেস্কটপ মেরামত", price: 600, desc: "ফ্রিজিং, ব্লু-স্ক্রিন, নো-ডিসপ্লে, থার্মাল পেস্ট পরিবর্তন ও হার্ডওয়্যার ডায়াগনোসিস।", icon: "💻" },
        { id: "s4", title: "উইন্ডোজ, সফটওয়্যার ও প্রিন্টার সেটআপ", price: 1000, desc: "ক্লিন উইন্ডোজ ১০/১১, অফিস, নেটওয়ার্ক প্রিন্টার/স্ক্যানার সেটআপ ও ড্রাইভার ফিক্স।", icon: "🖨️" },
        { id: "s5", title: "সিসিটিভি ও আইপি ক্যামেরা সেটআপ", price: 1200, desc: "কমপ্লিট ক্যামেরা ইন্সটলেশন, ডিভিআর/এনভিআর কনফিগ ও ২৪/৭ মোবাইল লাইভ-ভিউ।", icon: "📹" },
        { id: "s6", title: "পিসি আপগ্রেড, এসএসডি/র‍্যাম ও ব্যাকআপ", price: 600, desc: "এসএসডি/র‍্যাম আপগ্রেড করে পুরনো পিসি ফাস্ট করা, ওএস ক্লোনিং ও ডাটা ব্যাকআপ।", icon: "⚡" },
        { id: "s7", title: "রিমোট অনলাইন আইটি সাপোর্ট", price: 500, desc: "অ্যানিডেস্কের মাধ্যমে তাৎক্ষণিক সফটওয়্যার ফিক্স, ইমেইল কনফিগ ও এরর সমাধান।", icon: "🌐" },
        { id: "s8", title: "মাসিক আইটি রক্ষণাবেক্ষণ (AMC)", price: 4000, desc: "অফিসের জন্য সার্বক্ষণিক নিয়মিত প্রিভেন্টিভ মেইনটেন্যান্স ও ইমার্জেন্সি সাপোর্ট।", icon: "🏢" }
      ],
      reviewsList: [
        { name: "আরিফুল ইসলাম", location: "মোহাম্মদপুর, ঢাকা", role: "ব্যবসা পরিচালক", text: "আমাদের অফিসে ২০টি কম্পিউটারের নেটওয়ার্কিং ও মাইক্রোটিক ব্যান্ডউইথ কনফিগারেশন নিখুঁতভাবে শেষ করেছেন। নেট স্পিড চমৎকার!", rating: 5 },
        { name: "সাবরিনা সুলতানা", location: "ধানমন্ডি, ঢাকা", role: "হোম ইউজার", text: "বাসার ৩য় তলায় ওয়াইফাই সিগন্যাল পেতাম না। IPonion টেকনিশিয়ান এসে ১ ঘণ্টার মধ্যে রাউটার অপটিমাইজ ও এক্সটেন্ডার বসিয়ে সমাধান করে দেন।", rating: 5 },
        { name: "ইঞ্জি. তানভীর হাসান", location: "মিরপুর ডিওএইচএস", role: "সফটওয়্যার ডেভেলপার", text: "ল্যাপটপ ঘন ঘন ব্লু-স্ক্রিন দিয়ে বন্ধ হয়ে যাচ্ছিল। বাসায় এসে থার্মাল পেস্ট পরিবর্তন ও উইন্ডোজ ক্লিন ইন্সটল করে দেন। খুবই প্রফেশনাল!", rating: 5 },
        { name: "রাশেদ চৌধুরী", location: "বসিলা গার্ডেন সিটি", role: "অফিস ম্যানেজার", text: "নতুন অফিসের ৮টি সিসিটিভি ক্যামেরা ও মোবাইল লাইভ-ভিউ সেটআপ খুব নিখুঁতভাবে সম্পন্ন করেছেন। ২৪/৭ টেকনিক্যাল সাপোর্ট দারুণ!", rating: 5 }
      ]
    },
    en: {
      badge: "24/7 On-Demand Home & Office IT Support",
      heroTitle1: "Smart IT & Network Solutions",
      heroTitle2: "with",
      heroDesc: "Fast, reliable 24/7 troubleshooting for routers, Wi-Fi, laptops, desktops, network cabling, and CCTV cameras across whole Dhaka.",
      btnBook: "Book a Service",
      btnHotline: "Call Hotline (24/7)",
      btnWA: "WhatsApp Chat",
      stat1Num: "1,000+",
      stat1Txt: "Completed Jobs in Dhaka",
      stat2Num: "24/7",
      stat2Txt: "Round-the-clock Support",
      stat3Num: "50+",
      stat3Txt: "Active AMC Office Clients",
      stat4Num: "100%",
      stat4Txt: "Doorstep Visits Covered",
      servicesTag: "Our Services",
      servicesTitle: "Professional IT Solutions",
      servicesSubtitle: "Essential hardware, software, and networking support for homes and small offices",
      priceFrom: "From BDT ",
      bookNow: "Book",
      formTag: "Online Booking",
      formTitle: "Book an IT Support Service",
      formDesc: "Fill in the form. Our support team will contact you immediately via phone.",
      lblName: "Your Full Name *",
      lblPhone: "Phone Number *",
      lblService: "Select Required Service *",
      lblArea: "Location / Area (Whole Dhaka) *",
      lblDesc: "Brief Description of Problem (Optional)...",
      btnSubmit: "Confirm Booking",
      btnSubmitting: "Processing Booking...",
      modalTitle: "Booking Confirmed Successfully!",
      modalDesc: "Thank you! Your service request has been received by the IPonion support team. Our engineer will contact you shortly.",
      modalBtn: "Done / OK",
      reviewsTag: "Client Testimonials",
      reviewsTitle: "What Our Clients Say",
      reviewsSubtitle: "100% genuine feedback from homeowners and office businesses across Dhaka",
      worksWithTag: "Enterprise Hardware & Tech",
      worksWithTitle: "Technologies & Brands We Work With",
      worksWithSubtitle: "We engineer, configure, and troubleshoot enterprise-grade hardware standards",
      contactTag: "Contact & Hub",
      contactTitle: "Office Address & Map",
      contactSubtitle: "Visit our office hub or call our 24/7 helpline anytime for instant support",
      addressLabel: "Office Hub:",
      addressText: "House: 27, Road: 04, Block: D, Bosila Garden City, Mohammadpur, Dhaka",
      hotlineLabel: "24/7 Hotline:",
      waLabel: "Direct WhatsApp:",
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
        { name: "Ariful Islam", location: "Mohammadpur, Dhaka", role: "Business Director", text: "Configured structured cabling and MikroTik bandwidth management for 20 office PCs. Internet connection has been rock solid since then!", rating: 5 },
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
      {/* Background Tech Glow & Grid Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-200/25 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-orange-100/35 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 left-10 w-[600px] h-[600px] bg-emerald-100/25 rounded-full blur-[130px]"></div>
      </div>

      {/* Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          <Link href="/" className="hover:opacity-95 transition">
            <IponionLogo size={42} />
          </Link>

          <nav className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 hover:border-[#2D1457] text-xs font-bold text-slate-700 hover:text-[#2D1457] bg-white transition shadow-sm"
              title="Toggle Language"
            >
              <Globe size={14} className="text-[#FF6B57]" />
              <span>{lang === "bn" ? "English" : "বাংলা"}</span>
            </button>

            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-50 text-[#2D1457] font-bold text-xs hover:bg-violet-100 transition border border-violet-100"
            >
              <User size={14} /> <span className="hidden sm:inline">{curr.navPortal}</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100 transition"
            >
              <Shield size={14} /> <span className="hidden sm:inline">{curr.navAdmin}</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-14 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-[#FF6B57] font-extrabold text-xs uppercase tracking-wide border border-orange-200 shadow-sm mb-6">
            <Zap size={14} className="fill-[#FF6B57]" /> {curr.badge}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#2D1457] tracking-tight leading-[1.15]">
            {curr.heroTitle1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D1457] via-[#FF6B57] to-[#FF8A65]">
              IPonion
            </span> {curr.heroTitle2}
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {curr.heroDesc}
          </p>

          <div className="mt-9 flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            <a href="#booking" className="px-8 py-4 rounded-2xl bg-[#2D1457] text-white font-bold text-sm sm:text-base hover:bg-[#3D1A75] shadow-xl shadow-violet-950/25 transition transform hover:-translate-y-0.5 inline-flex items-center gap-2">
              {curr.btnBook} <ArrowRight size={16} />
            </a>
            <a href="https://wa.me/8801991477412?text=Hello%20IPonion,%20I%20need%20IT%20Support." target="_blank" className="px-7 py-4 rounded-2xl bg-[#25D366] text-white font-bold text-sm sm:text-base hover:bg-[#20bd5a] shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2 transition transform hover:-translate-y-0.5">
              <MessageCircle size={18} /> {curr.btnWA}
            </a>
            <a href="tel:01991477412" className="px-6 py-4 rounded-2xl border-2 border-slate-300 font-bold text-sm sm:text-base hover:bg-white inline-flex items-center gap-2 text-slate-800 transition">
              <Phone size={18} /> 01991-477412
            </a>
          </div>
        </div>
      </section>

      {/* Modern Stats Ribbon */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/40 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#2D1457]">{curr.stat1Num}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">{curr.stat1Txt}</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#FF6B57]">{curr.stat2Num}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">{curr.stat2Txt}</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#2D1457]">{curr.stat3Num}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">{curr.stat3Txt}</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600">{curr.stat4Num}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">{curr.stat4Txt}</div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative z-10 max-w-7xl mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-[#FF6B57] bg-orange-50 px-3 py-1 rounded-full border border-orange-200/60">{curr.servicesTag}</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2D1457] mt-3 tracking-tight">{curr.servicesTitle}</h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">{curr.servicesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {curr.servicesList.map((s) => (
            <div key={s.id} className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-violet-300 hover:shadow-2xl hover:shadow-violet-950/5 transition duration-200 flex flex-col justify-between group">
              <div>
                <div className="text-3xl mb-4 w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center group-hover:scale-110 transition duration-200">{s.icon}</div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2 leading-snug">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">{curr.priceFrom}</span>
                  <span className="text-lg font-black text-[#2D1457]">৳{s.price.toLocaleString()}</span>
                </div>
                <a href="#booking" onClick={() => setSelectedService(s.title)} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B57]/10 text-[#FF6B57] hover:bg-[#FF6B57] hover:text-white transition shadow-sm">
                  {curr.bookNow}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="booking" className="relative z-10 max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-12 border border-slate-200 shadow-2xl shadow-slate-200/60">
          <div className="text-center max-w-xl mx-auto mb-9">
            <span className="text-xs font-black uppercase tracking-widest text-[#FF6B57]">{curr.formTag}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2D1457] mt-1.5">{curr.formTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{curr.formDesc}</p>
          </div>

          <form onSubmit={handleBooking} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{curr.lblName}</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="যেমন: মো: আরিফুল ইসলাম" className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 text-sm outline-none focus:border-[#2D1457] focus:ring-2 focus:ring-[#2D1457]/10 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{curr.lblPhone}</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="017XXXXXXXX" className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 text-sm outline-none focus:border-[#2D1457] focus:ring-2 focus:ring-[#2D1457]/10 transition" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{curr.lblService}</label>
                <select required value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 text-sm bg-white outline-none focus:border-[#2D1457] focus:ring-2 focus:ring-[#2D1457]/10 transition">
                  <option value="">-- {curr.lblService} --</option>
                  {curr.servicesList.map((s) => (
                    <option key={s.id} value={s.title}>{s.title} ({curr.priceFrom}{s.price})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{curr.lblArea}</label>
                <input type="text" required value={area} onChange={(e) => setArea(e.target.value)} placeholder="যেমন: বসিলা, মোহাম্মদপুর, ধানমন্ডি..." className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 text-sm outline-none focus:border-[#2D1457] focus:ring-2 focus:ring-[#2D1457]/10 transition" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{curr.lblDesc}</label>
              <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="কম্পিউটার বা নেটওয়ার্কে কী সমস্যা হচ্ছে সংক্ষেপে লিখুন..." className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 text-sm outline-none focus:border-[#2D1457] focus:ring-2 focus:ring-[#2D1457]/10 transition" />
            </div>

            <button type="submit" disabled={submitting} className="w-full py-4 rounded-2xl bg-[#2D1457] text-white font-bold text-base hover:bg-[#3D1A75] transition shadow-xl shadow-violet-950/20 disabled:opacity-50">
              {submitting ? curr.btnSubmitting : curr.btnSubmit}
            </button>
          </form>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="relative z-10 max-w-7xl mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-[#FF6B57] bg-orange-50 px-3 py-1 rounded-full border border-orange-200/60">{curr.reviewsTag}</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2D1457] mt-3 tracking-tight">{curr.reviewsTitle}</h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">{curr.reviewsSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {curr.reviewsList.map((rev, i) => (
            <div key={i} className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md shadow-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-5">"{rev.text}"</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-[#2D1457]">{rev.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{rev.role} • 📍 {rev.location}</p>
                </div>
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HARDWARE & TECHNOLOGIES WE WORK WITH (WORKS WITH - POSITIONED DIRECTLY ABOVE CONTACT) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-6">
        <div className="bg-gradient-to-r from-violet-950 via-[#2D1457] to-[#1C0D36] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle tech background circle glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B57]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center max-w-2xl mx-auto mb-8 relative z-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF6B57] bg-white/10 px-3 py-1 rounded-full border border-white/15">
              {curr.worksWithTag}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-3">{curr.worksWithTitle}</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">{curr.worksWithSubtitle}</p>
          </div>

          {/* Clean Enterprise Brand Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 relative z-10 select-none">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#FF6B57] hover:bg-white/20 transition flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <span className="font-black text-sm sm:text-base tracking-wider">CISCO</span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#FF6B57] hover:bg-white/20 transition flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B57]"></span>
              <span className="font-black text-sm sm:text-base tracking-wider">MIKROTIK</span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#FF6B57] hover:bg-white/20 transition flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <span className="font-black text-sm sm:text-base tracking-wider">JUNIPER</span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#FF6B57] hover:bg-white/20 transition flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <span className="font-black text-sm sm:text-base tracking-wider">TP-LINK</span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#FF6B57] hover:bg-white/20 transition flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="font-black text-sm sm:text-base tracking-wider">HP ENTERPRISE</span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#FF6B57] hover:bg-white/20 transition flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="font-black text-sm sm:text-base tracking-wider">UBIQUITI</span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#FF6B57] hover:bg-white/20 transition flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              <span className="font-black text-sm sm:text-base tracking-wider">HIKVISION</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Real Google Map Hub Section */}
      <section className="relative z-10 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Contact Details Card */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-black uppercase text-[#FF6B57] tracking-widest">{curr.contactTag}</span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#2D1457] mt-1">{curr.contactTitle}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">{curr.contactSubtitle}</p>
              </div>

              <div className="p-5 rounded-2xl bg-violet-50/70 border border-violet-100 space-y-2">
                <div className="text-xs font-bold text-[#FF6B57] flex items-center gap-1.5 uppercase tracking-wide">
                  <MapPin size={15} /> {curr.addressLabel}
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">{curr.addressText}</p>
              </div>

              <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-100 space-y-2.5">
                <div className="text-xs font-bold text-[#FF6B57] flex items-center gap-1.5 uppercase tracking-wide">
                  <Phone size={15} /> {curr.hotlineLabel}
                </div>
                <a href="tel:01991477412" className="block text-2xl font-black text-[#2D1457] hover:underline">01991-477412</a>
                <div className="pt-2 border-t border-orange-200/60">
                  <a href="https://wa.me/8801991477412?text=Hello%20IPonion,%20I%20need%20IT%20Support." target="_blank" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline">
                    <MessageCircle size={15} /> {curr.waLabel} +880 1991-477412
                  </a>
                </div>
              </div>
            </div>

            {/* Exact Google Map Embed */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 shadow-md h-80 sm:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d280.84051789958835!2d90.34059921039857!3d23.75385838069246!3m2!1i1024!2i768!4f13.1!2m1!1shouse%2027%20Road%2004%20block%3A-%20D%20Bosila%20garden%20city%20Mohammadpur%20Dhaka!5e1!3m2!1sen!2sbd!4v1794165134399!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href="https://wa.me/8801991477412?text=Hello%20IPonion,%20I%20need%20IT%20Support."
        target="_blank"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition flex items-center gap-2 font-bold text-sm"
        title="WhatsApp Chat"
      >
        <MessageCircle size={22} />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Footer */}
      <footer className="relative z-10 bg-[#1C0D36] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 text-center text-xs border-t border-violet-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <IponionLogo size={36} />
          <p>&copy; 2026 IPonion. {curr.footerRights}</p>
          <div className="text-slate-300 font-bold">Hotline: 01991-477412</div>
        </div>
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
              <div className="bg-slate-50 p-4 rounded-2xl text-left text-xs space-y-1.5 mb-6 border border-slate-200">
                <div><strong>Service:</strong> {bookingData.service}</div>
                <div><strong>Name:</strong> {bookingData.name} ({bookingData.phone})</div>
                <div><strong>Location:</strong> {bookingData.area}</div>
              </div>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3.5 bg-[#2D1457] text-white font-bold text-sm rounded-2xl hover:bg-[#3D1A75] transition shadow-md shadow-violet-950/20"
            >
              {curr.modalBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}