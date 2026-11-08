"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Service } from "@/types";
import { Phone, MessageCircle, MapPin, Zap } from "lucide-react";

const defaultServices: Service[] = [
  { id: "s1", title: "Wi-Fi & Router Troubleshooting", price: 600, description: "Fix speed drops, frequent disconnections, dead zones, and security setup.", active: true, icon: "📶" },
  { id: "s2", title: "Home & Office Network Setup", price: 1500, description: "Cat6 cabling, Gigabit switches, MikroTik router config, bandwidth management & printer sharing.", active: true, icon: "🖧" },
  { id: "s3", title: "Laptop & Desktop Repair/Support", price: 600, description: "Fix freezing, blue screen crashes, no display, thermal paste replacement & diagnosis.", active: true, icon: "💻" },
  { id: "s4", title: "Windows, Software & Printer Setup", price: 1000, description: "Clean Windows 10/11 install, MS Office, network printer/scanner setup & driver fixes.", active: true, icon: "🖨️" },
  { id: "s5", title: "CCTV & IP Camera Setup", price: 1200, description: "Complete CCTV & IP camera setup, DVR/NVR configuration & 24/7 mobile live-view access.", active: true, icon: "📹" },
  { id: "s6", title: "PC Upgrades, SSD/RAM & Backup", price: 600, description: "Speed up old machines with NVMe/SATA SSDs, RAM upgrade, seamless OS cloning & data backup.", active: true, icon: "⚡" },
  { id: "s7", title: "Remote Online IT Support", price: 500, description: "Instant online help anywhere in Bangladesh via AnyDesk for software & errors.", active: true, icon: "🌐" },
  { id: "s8", title: "Monthly IT Maintenance (AMC)", price: 4000, description: "Complete contract for small offices: routine preventive care, network health & emergency SLA.", active: true, icon: "🏢" }
];

export default function HomePage() {
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [area, setArea] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setServices(data.filter((s: Service) => s.active));
      })
      .catch(() => {});
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_name: name, phone, service_title: selectedService, area, problem_desc: desc })
      });
      const data = await res.json();
      if (data.success && data.whatsappUrl) {
        alert("✅ বুকিং সফল হয়েছে! হোয়াটসঅ্যাপে কনফার্মেশনের জন্য পাঠানো হচ্ছে...");
        window.open(data.whatsappUrl, "_blank");
      } else {
        const wa = `https://wa.me/8801791477412?text=New%20Booking%20for%20${encodeURIComponent(selectedService)}%20from%20${encodeURIComponent(name)}%20(${phone})`;
        window.open(wa, "_blank");
      }
    } catch {
      alert("বুকিং জমা হয়েছে! সরাসরি হোয়াটসঅ্যাপে পাঠানো হচ্ছে...");
      window.open(`https://wa.me/8801791477412`, "_blank");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <section className="bg-gradient-to-b from-violet-50/60 via-white to-slate-50 py-16 sm:py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-[#FF6B57] font-extrabold text-xs uppercase tracking-wide border border-orange-200">
            <Zap size={14} className="fill-[#FF6B57]" /> ২৪/৭ অন-ডিমান্ড হোম ও অফিস আইটি সাপোর্ট
          </div>
          <h1 className="mt-5 text-4xl sm:text-6xl font-black text-[#2D1457] tracking-tight leading-tight">
            স্মার্ট আইটি সলিউশন <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D1457] via-[#FF6B57] to-[#FF8A65]">
              IPonion
            </span> এর সাথে
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            রাউটার, ওয়াইফাই, ল্যাপটপ, ডেস্কটপ, নেটওয়ার্কিং ও সিসিটিভি ক্যামেরার যেকোনো জটিল সমস্যার দ্রুত ও নির্ভরযোগ্য ২৪/৭ সমাধান।
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#booking" className="px-7 py-3.5 rounded-xl bg-[#2D1457] text-white font-bold hover:bg-[#3D1A75] shadow-lg shadow-violet-950/20">
              সার্ভিস বুক করুন
            </a>
            <a href="https://wa.me/8801791477412?text=Hello%20IPonion,%20I%20need%20IT%20support." target="_blank" className="px-7 py-3.5 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#20bd5a] inline-flex items-center gap-2">
              <MessageCircle size={18} /> WhatsApp চ্যাট
            </a>
            <a href="tel:01791477412" className="px-6 py-3.5 rounded-xl border-2 border-slate-300 font-bold hover:bg-slate-100 inline-flex items-center gap-2">
              <Phone size={18} /> 01791-477412
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B57]">Our Services</span>
          <h2 className="text-3xl font-black text-[#2D1457] mt-1">পেশাদার আইটি সমাধান</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-violet-300 hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-4 w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">{s.icon}</div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-3">{s.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-500">
                  শুরু <span className="text-base font-black text-[#2D1457]">৳{Number(s.price).toLocaleString()}</span>
                </div>
                <a href="#booking" onClick={() => setSelectedService(s.title)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF6B57]/10 text-[#FF6B57] hover:bg-[#FF6B57] hover:text-white transition">
                  বুক করুন
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="booking" className="bg-slate-100 py-16 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-black text-[#2D1457] mb-2">আইটি সাপোর্ট সার্ভিস বুক করুন</h2>
          <p className="text-sm text-slate-500 mb-8">ফর্মটি সাবমিট করলে দ্রুত আপনার ঠিকানায় টেকনিশিয়ান পাঠানো হবে। পেমেন্ট: ক্যাশ অন কমপ্লিশন।</p>
          <form onSubmit={handleBooking} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম *" className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm" />
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর *" className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select required value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm bg-white">
                <option value="">সার্ভিস নির্বাচন করুন *</option>
                {services.map((s) => (
                  <option key={s.id} value={s.title}>{s.title} (৳{s.price})</option>
                ))}
              </select>
              <input type="text" required value={area} onChange={(e) => setArea(e.target.value)} placeholder="লোকেশন / এলাকা (সমগ্র ঢাকা) *" className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm" />
            </div>
            <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="সমস্যার সংক্ষিপ্ত বিবরণ..." className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm" />
            <button type="submit" disabled={submitting} className="w-full py-4 rounded-xl bg-[#2D1457] text-white font-bold text-base hover:bg-[#3D1A75]">
              {submitting ? "বুকিং পাঠানো হচ্ছে..." : "বুকিং কনফার্ম করুন (WhatsApp সহ)"}
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-[#1C0D36] text-slate-400 py-10 px-4 text-center text-xs">
        &copy; 2026 IPonion. সর্বস্বত্ব সংরক্ষিত। 24/7 IT Support across Dhaka. Hotline: 01791-477412
      </footer>
    </div>
  );
}
