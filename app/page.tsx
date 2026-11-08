"use client";

import { useState, useEffect } from "react";
import IponionLogo from "@/components/Logo";
import { Phone, MessageCircle, MapPin, Zap, CheckCircle2, Globe, X, User, Shield } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [lang, setLang] = useState("bn"); // 'bn' | 'en'
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [area, setArea] = useState("");
  const [desc, setDesc] = useState("");

  // ভাষা পরিবর্তন মনে রাখা
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
      heroDesc: "রাউটার, ওয়াইফাই, ল্যাপটপ, ডেস্কটপ, নেটওয়ার্কিং ও সিসিটিভি ক্যামেরার যেকোনো জটিল সমস্যার দ্রুত ও নির্ভরযোগ্য ২৪/৭ সমাধান সমগ্র ঢাকা জুড়ে।",
      btnBook: "সার্ভিস বুক করুন",
      btnHotline: "হটলাইন কল",
      trust1: "✓ ২৪/৭ সেবা খোলা",
      trust2: "✓ সমগ্র ঢাকা হোম ভিজিট",
      trust3: "✓ ১০০% ডাটা সুরক্ষা",
      trust4: "✓ ক্যাশ অন কমপ্লিশন",
      servicesTitle: "পেশাদার আইটি সমাধান",
      servicesSubtitle: "বাসাবাড়ি ও অফিসের জন্য প্রয়োজনীয় হার্ডওয়্যার, সফটওয়্যার ও নেটওয়ার্কিং সেবা",
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
      mapTitle: "অফিস লোকেশন",
      mapAddress: "House: 27, Road: 04, Block: D, Bosila Garden City, Mohammadpur, Dhaka-1207",
      mapLink: "Google Maps এ দেখুন ↗",
      footerRights: "সর্বস্বত্ব সংরক্ষিত। 24/7 IT Support across Dhaka. Hotline: 01791-477412",
      navPortal: "Customer Portal",
      navAdmin: "Admin",
      servicesList: [
        { id: "s1", title: "Wi-Fi ও রাউটার ট্রাবলশুটিং", price: 600, desc: "গতি কমে যাওয়া, ঘন ঘন ডিসকানেকশন ও রাউটার সিকিউরিটি অপটিমাইজেশন।", icon: "📶" },
        { id: "s2", title: "হোম ও অফিস নেটওয়ার্ক সেটআপ", price: 1500, desc: "Cat6 ক্যাবলিং, গিগাবিট সুইচ, মাইক্রোটিক কনফিগ ও ব্যান্ডউইথ ম্যানেজমেন্ট।", icon: "🖧" },
        { id: "s3", title: "ল্যাপটপ ও ডেস্কটপ মেরামত", price: 600, desc: "ফ্রিজিং, ব্লু-স্ক্রিন, থার্মাল পেস্ট পরিবর্তন ও হার্ডওয়্যার ডায়াগনোসিস।", icon: "💻" },
        { id: "s4", title: "উইন্ডোজ, সফটওয়্যার ও প্রিন্টার সেটআপ", price: 1000, desc: "ক্লিন উইন্ডোজ ১০/১১, অফিস, নেটওয়ার্ক প্রিন্টার/স্ক্যানার সেটআপ।", icon: "🖨️" },
        { id: "s5", title: "সিসিটিভি ও আইপি ক্যামেরা সেটআপ", price: 1200, desc: "কমপ্লিট ক্যামেরা ইন্সটলেশন, ডিভিআর/এনভিআর ও ২৪/৭ মোবাইল লাইভ-ভিউ।", icon: "📹" },
        { id: "s6", title: "পিসি আপগ্রেড, এসএসডি/র‍্যাম ও ব্যাকআপ", price: 600, desc: "এসএসডি/র‍্যাম আপগ্রেড করে পুরনো পিসি ফাস্ট করা ও ডাটা ব্যাকআপ।", icon: "⚡" },
        { id: "s7", title: "রিমোট অনলাইন আইটি সাপোর্ট", price: 500, desc: "অ্যানিডেস্কের মাধ্যমে তাৎক্ষণিক সফটওয়্যার ফিক্স ও কনফিগারেশন।", icon: "🌐" },
        { id: "s8", title: "মাসিক আইটি রক্ষণাবেক্ষণ (AMC)", price: 4000, desc: "অফিসের জন্য সার্বক্ষণিক নিয়মিত মেইনটেন্যান্স ও ইমার্জেন্সি সাপোর্ট।", icon: "🏢" }
      ]
    },
    en: {
      tag: "24/7 On-Demand Home & Office IT Support",
      hero1: "Smart IT & Network Solutions",
      hero2: "with",
      heroDesc: "Fast, reliable 24/7 troubleshooting for routers, Wi-Fi, laptops, desktops, network cabling, and CCTV cameras across whole Dhaka.",
      btnBook: "Book a Service",
      btnHotline: "Call Hotline",
      trust1: "✓ 24/7 Available",
      trust2: "✓ Whole Dhaka Visits",
      trust3: "✓ 100% Data Privacy",
      trust4: "✓ Cash on Completion",
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
      mapTitle: "Office Location Hub",
      mapAddress: "House: 27, Road: 04, Block: D, Bosila Garden City, Mohammadpur, Dhaka-1207",
      mapLink: "View on Google Maps ↗",
      footerRights: "All Rights Reserved. 24/7 IT Support across Dhaka. Hotline: 01791-477412",
      navPortal: "Customer Portal",
      navAdmin: "Admin",
      servicesList: [
        { id: "s1", title: "Wi-Fi & Router Troubleshooting", price: 600, desc: "Fix speed drops, frequent disconnections, dead zones, & security setup.", icon: "📶" },
        { id: "s2", title: "Home & Office Network Setup", price: 1500, desc: "Cat6 cabling, Gigabit switches, MikroTik router config & bandwidth control.", icon: "🖧" },
        { id: "s3", title: "Laptop & Desktop Repair/Support", price: 600, desc: "Fix freezing, blue screen crashes, thermal paste replacement & diagnosis.", icon: "💻" },
        { id: "s4", title: "Windows, Software & Printer Setup", price: 1000, desc: "Clean Windows 10/11 install, MS Office, network printer/scanner setup.", icon: "🖨️" },
        { id: "s5", title: "CCTV & IP Camera Setup", price: 1200, desc: "Complete CCTV & IP camera installation, DVR/NVR config & 24/7 mobile live-view.", icon: "📹" },
        { id: "s6", title: "PC Upgrades, SSD/RAM & Backup", price: 600, desc: "Speed up old machines with NVMe/SATA SSDs, RAM upgrade & OS cloning.", icon: "⚡" },
        { id: "s7", title: "Remote Online IT Support", price: 500, desc: "Instant online help anywhere in Bangladesh via AnyDesk for quick fixes.", icon: "🌐" },
        { id: "s8", title: "Monthly IT Maintenance (AMC)", price: 4000, desc: "Complete maintenance contract for small offices: routine checks & priority SLA.", icon: "🏢" }
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-95 transition">
            <IponionLogo size={40} />
          </Link>

          <nav className="flex items-center gap-2.5">
            {/* Language Switcher Button */}
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
              <User size={14} /> {curr.navPortal}
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-semibold"
            >
              <Shield size={14} /> {curr.navAdmin}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-violet-50/60 via-white to-slate-50 py-16 sm:py-24 px-4 text-center">
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

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#booking" className="px-7 py-3.5 rounded-xl bg-[#2D1457] text-white font-bold hover:bg-[#3D1A75] shadow-lg shadow-violet-950/20 transition">
              {curr.btnBook}
            </a>
            <a href="tel:01791477412" className="px-6 py-3.5 rounded-xl border-2 border-slate-300 font-bold hover:bg-slate-100 inline-flex items-center gap-2 text-slate-800 transition">
              <Phone size={18} /> {curr.btnHotline}: 01791-477412
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

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B57]">IPonion Solutions</span>
          <h2 className="text-3xl font-black text-[#2D1457] mt-1">{curr.servicesTitle}</h2>
          <p className="text-slate-600 text-sm mt-1">{curr.servicesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {curr.servicesList.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-violet-300 hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-4 w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">{s.icon}</div>
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
      <section id="booking" className="bg-slate-100 py-16 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-black text-[#2D1457] mb-2">{curr.formTitle}</h2>
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

      {/* Map Section */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-black text-xl text-[#2D1457] flex items-center gap-2">
                <MapPin className="text-[#FF6B57]" size={20} /> {curr.mapTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{curr.mapAddress}</p>
            </div>
            <a href="https://maps.app.goo.gl/pRcSCRoXLjs5Zuew7" target="_blank" className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-violet-50 text-[#2D1457]">
              {curr.mapLink}
            </a>
          </div>
          <iframe className="w-full h-72 rounded-2xl border-0" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.8475269787037!2d90.3475!3d23.7525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ1JzA5LjAiTiA5MMKwMjAnNTEuMCJF!5e0!3m2!1sen!2sbd!4v1650000000000!5m2!1sen!2sbd" loading="lazy" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1C0D36] text-slate-400 py-10 px-4 text-center text-xs">
        &copy; 2026 IPonion. {curr.footerRights}
      </footer>

      {/* POPUP MODAL ON BOOKING SUCCESS (NO WHATSAPP REDIRECT) */}
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