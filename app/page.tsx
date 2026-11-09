"use client";

import { useState, useEffect } from "react";
import IponionLogo from "@/components/Logo";
import { Phone, MessageCircle, MapPin, Zap, CheckCircle2, Globe, X, User, Shield, Star, Clock, Server, Check, ArrowRight, Wrench } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  const [service, setService] = useState("Wi-Fi ও রাউটার ট্রাবলশুটিং");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("iponion_lang") as "bn" | "en";
      if (savedLang) setLang(savedLang);
    }
  }, []);

  const toggleLang = (newLang: "bn" | "en") => {
    setLang(newLang);
    localStorage.setItem("iponion_lang", newLang);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !service) return;

    setSubmitting(true);
    const newBooking = {
      id: "bk_" + Date.now(),
      service_title: service,
      customer_name: name || (lang === "bn" ? "সম্মানিত কাস্টমার" : "Valued Customer"),
      customer_phone: phone,
      customer_address: area || "Mohammadpur, Dhaka",
      area: area || "Dhaka",
      problem_desc: desc,
      status: "Pending",
      created_at: new Date().toISOString()
    };

    // Save in LocalStorage
    try {
      const existing = localStorage.getItem("iponion_bookings");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newBooking);
      localStorage.setItem("iponion_bookings", JSON.stringify(list));
    } catch (err) {}

    // Send FormSubmit Notification to Admin Emails
    try {
      await fetch("https://formsubmit.co/ajax/iponion.11@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `🚨 নতুন বুকিং: ${service} - ${name} (${phone})`,
          _cc: "tanvirahmedtanvir68441@gmail.com",
          _template: "table",
          "Service Requested": service,
          "Customer Name": name,
          "Customer Phone": phone,
          "Customer Address": area,
          "Problem Note": desc || "N/A",
          "Timestamp": new Date().toLocaleString()
        })
      });
    } catch (err) {}

    setBookingData(newBooking);
    setSubmitting(false);
    setShowModal(true);

    // Reset Form
    setName("");
    setPhone("");
    setArea("");
    setDesc("");
  };

  const services = [
    {
      title_bn: "Wi-Fi ও রাউটার ট্রাবলশুটিং",
      title_en: "Wi-Fi & Router Troubleshooting",
      desc_bn: "স্পিড ড্রপ, সিগন্যাল ডেড-জোন দূরীকরণ ও নেটওয়ার্ক কনফিগারেশন।",
      desc_en: "Eliminate dead-zones, fix slow speeds and seamless dual-band Wi-Fi setup.",
      price_bn: "৳৫০০ থেকে শুরু",
      price_en: "Starts from ৳500"
    },
    {
      title_bn: "বাসা ও অফিসের ল্যান (LAN) নেটওয়ার্কিং",
      title_en: "Home & Office LAN Networking",
      desc_bn: "ক্যাট-৬ ক্যাবলিং, সুইটচ ও প্যাচ প্যানেল ড্রেসিং এবং হাই-স্পিড লোকাল নেটওয়ার্ক।",
      desc_en: "Structured Cat6 cabling, switch setup, and high-speed office connectivity.",
      price_bn: "৳১,২০০ থেকে শুরু",
      price_en: "Starts from ৳1,200"
    },
    {
      title_bn: "সরাসরি অন-সাইট কম্পিউটার ও ল্যাপটপ রিপেয়ার",
      title_en: "On-Site Computer & Laptop Repair",
      desc_bn: "উইন্ডোজ সেটআপ, র‍্যাম/এসএসডি আপগ্রেড, ওভারহিটিং ও মাদারবোর্ড সমাধান।",
      desc_en: "OS installation, SSD/RAM upgrades, thermal throttling fix, hardware servicing.",
      price_bn: "৳৮০০ থেকে শুরু",
      price_en: "Starts from ৳800"
    },
    {
      title_bn: "CCTV ও আইপি ক্যামেরা সেটআপ",
      title_en: "CCTV & IP Camera Security Setup",
      desc_bn: "HD/IP ক্যামেরা ইনস্টলেশন, DVR/NVR কনফিগারেশন ও মোবাইলে সার্বক্ষণিক লাইভ ভিউ।",
      desc_en: "HD/IP camera mounting, NVR/DVR setup, and 24/7 mobile live streaming.",
      price_bn: "৳১,৫০০ থেকে শুরু",
      price_en: "Starts from ৳1,500"
    },
    {
      title_bn: "মাইক্রোটিক ও এন্টারপ্রাইজ ফায়ারওয়াল",
      title_en: "MikroTik & Enterprise Firewall",
      desc_bn: "ব্যান্ডউইথ কন্ট্রোল, লোড ব্যালেন্সিং, ভিপিএন এবং সিকিউরিটি পলিসি কনফিগারেশন।",
      desc_en: "Bandwidth queueing, load balancing, multi-WAN failover, and secure VPNs.",
      price_bn: "৳২,০০০ থেকে শুরু",
      price_en: "Starts from ৳2,000"
    },
    {
      title_bn: "রিমোট অনলাইন আইটি সাপোর্ট (Remote)",
      title_en: "Instant Remote Online IT Support",
      desc_bn: "AnyDesk বা TeamViewer দিয়ে দূর থেকেই সফ্টওয়্যার, প্রিন্টার ও জরুরি সমাধান।",
      desc_en: "Fast remote assistance for software crashes, printer drivers, and mail issues.",
      price_bn: "৳৩০০ থেকে শুরু",
      price_en: "Starts from ৳300"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#FF6B57] selection:text-white">
      {/* 1. TOP PORTAL ACCESS STRIP (ALADA LOGIN BAR) */}
      <div className="bg-[#1a0b33] text-white text-[11px] py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-300">
            <a href="tel:01991477412" className="px-5 py-3.5 bg-[#81B472] hover:bg-[#72a363] text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all">
                <Phone size={16} /> 01991477412
              </a>
              <a href="tel:096116786" className="px-5 py-3.5 bg-[#5894FF] hover:bg-[#4382f5] text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all">
                <Phone size={16} /> 096116786
              </a>
              <a href="https://wa.me/8801991477412" target="_blank" rel="noopener noreferrer" className="px-5 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SERVICES GRID */}
      <section id="services" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {lang === "bn" ? "আমাদের নির্ভরযোগ্য সার্ভিসসমূহ" : "Our Professional IT Services"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {lang === "bn" ? "বাসাবাড়ি ও করপোরেট অফিসের জন্য মানসম্মত আইটি সেবা" : "Quality on-demand services for residential homes & corporate offices"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-violet-500 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-[#2D1457] flex items-center justify-center font-bold mb-4">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">
                    {lang === "bn" ? s.title_bn : s.title_en}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {lang === "bn" ? s.desc_bn : s.desc_en}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-md">
                    {lang === "bn" ? s.price_bn : s.price_en}
                  </span>
                  <a
                    href="#booking"
                    onClick={() => setService(lang === "bn" ? s.title_bn : s.title_en)}
                    className="text-xs font-bold text-[#FF6B57] hover:underline"
                  >
                    {lang === "bn" ? "বুক করুন →" : "Book Now →"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BOOKING FORM */}
      <section id="booking" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-[#2D1457] text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-3 py-1 rounded-full">
                {lang === "bn" ? "তাৎক্ষণিক বুকিং" : "Instant Booking"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-3">
                {lang === "bn" ? "সার্ভিসের জন্য বুকিং নিশ্চিত করুন" : "Book Your IT Service Now"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {lang === "bn" ? "ফর্মটি পূরণ করুন, আমাদের সাপোর্ট টিম খুব দ্রুত যোগাযোগ করবে।" : "Submit the form, our expert team will contact you immediately."}
              </p>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  {lang === "bn" ? "সার্ভিস বেছে নিন *" : "Select Service *"}
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full text-sm font-semibold p-3.5 bg-white text-slate-900 rounded-xl focus:outline-none"
                  required
                >
                  {services.map((s, idx) => (
                    <option key={idx} value={lang === "bn" ? s.title_bn : s.title_en}>
                      {lang === "bn" ? s.title_bn : s.title_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    {lang === "bn" ? "আপনার নাম *" : "Your Name *"}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === "bn" ? "যেমন: তানভীর আহমেদ" : "e.g. Tanvir Ahmed"}
                    required
                    className="w-full text-sm p-3.5 bg-white text-slate-900 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    {lang === "bn" ? "মোবাইল নম্বর *" : "Phone Number *"}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01991477412"
                    required
                    className="w-full text-sm p-3.5 bg-white text-slate-900 rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  {lang === "bn" ? "বাসা/অফিস ও এলাকা *" : "Your Address & Area *"}
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder={lang === "bn" ? "যেমন: বাড়ি ২৭, রোড ০৪, ব্লক ডি, বসিলা গার্ডেন সিটি" : "e.g. House 27, Road 04, Bosila Garden City"}
                  required
                  className="w-full text-sm p-3.5 bg-white text-slate-900 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  {lang === "bn" ? "সমস্যার সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)" : "Problem Details (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder={lang === "bn" ? "যেমন: রাউটারের রেড লাইট জ্বলছে..." : "e.g. Router red light blinking..."}
                  className="w-full text-sm p-3 bg-white text-slate-900 rounded-xl focus:outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#FF6B57] hover:bg-[#e85845] text-white font-black text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>{lang === "bn" ? "কনফার্ম হচ্ছে..." : "Confirming..."}</span>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    {lang === "bn" ? "বুকিং কনফার্ম করুন" : "Confirm Service Booking"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 6. TECHNOLOGIES WE WORK WITH */}
      <section id="technologies" className="py-12 bg-slate-50 border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            {lang === "bn" ? "আমরা যেসব বিশ্বখ্যাত ব্র্যান্ডের সাথে কাজ করি" : "Technologies & Enterprise Brands We Work With"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all font-mono font-black text-slate-800 text-sm sm:text-base">
            <span className="hover:text-cyan-600 transition-colors">CISCO</span>
            <span className="hover:text-red-600 transition-colors">MIKROTIK</span>
            <span className="hover:text-blue-600 transition-colors">JUNIPER</span>
            <span className="hover:text-teal-600 transition-colors">TP-LINK</span>
            <span className="hover:text-emerald-600 transition-colors">HP ENTERPRISE</span>
            <span className="hover:text-blue-500 transition-colors">UBIQUITI</span>
            <span className="hover:text-rose-600 transition-colors">HIKVISION</span>
          </div>
        </div>
      </section>

      {/* 7. CONTACT & STANDARD MAP */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Contact Details */}
            <div>
              <span className="text-xs font-bold text-violet-700 bg-violet-100 px-3 py-1 rounded-full">
                {lang === "bn" ? "আমাদের ঠিকানা" : "Our Office Location"}
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-3 mb-4">
                {lang === "bn" ? "সরাসরি যোগাযোগ ও অফিস ভিজিট" : "Get in Touch & Visit Us"}
              </h2>

              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#FF6B57] flex-shrink-0 mt-1" />
                  <div>
                    <strong className="text-slate-900">অফিস ঠিকানা:</strong>
                    <p>House: 27, Road: 04, Block: D, Bosila Garden City, Mohammadpur, Dhaka.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-[#81B472] flex-shrink-0 mt-1" />
                  <div>
                    <strong className="text-slate-900">হটলাইন ও টেলিফোন যোগাযোগ:</strong>
                    <p className="font-mono text-slate-700 mt-1">
                      মোবাইল ও WhatsApp: <a href="tel:01991477412" className="font-bold text-slate-900 hover:underline">01991477412</a>
                    </p>
                    <p className="font-mono text-slate-700 mt-0.5">
                      টেলিফোন (IP Phone): <a href="tel:096116786" className="font-bold text-[#5894FF] hover:underline">096116786</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Size Responsive Map */}
            <div className="w-full h-[400px] md:h-[450px] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d383.8500617922683!2d90.34048948775155!3d23.75387596635493!3m2!1i1024!2i768!4f13.1!2m1!1shouse%2027%20Road%2004%20block%3A-%20D%20Bosila%20garden%20city%20Mohammadpur%20Dhaka!5e0!3m2!1sen!2sbd!4v1794166645987!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER WITH THREE DISTINCT PORTAL LINKS */}
      <footer className="bg-[#150727] text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
            <IponionLogo size="md" />

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
              <Link href="/auth" className="text-slate-300 hover:text-white transition-colors">
                👤 কাস্টমার পোর্টাল
              </Link>
              <span className="text-slate-600">•</span>
              <Link href="/engineer" className="text-lime-400 hover:text-lime-300 transition-colors">
                🛠️ ফিল্ড ইঞ্জিনিয়ার লগইন
              </Link>
              <span className="text-slate-600">•</span>
              <Link href="/admin" className="text-slate-300 hover:text-white transition-colors">
                🔐 অ্যাডমিন প্যানেল
              </Link>
            </div>
          </div>

          <div className="pt-6 text-center text-xs text-slate-400">
            হটলাইন: <a href="tel:01991477412" className="text-white hover:underline">01991477412</a> • টেলিফোন: <a href="tel:096116786" className="text-[#5894FF] hover:underline">096116786</a> • মোহাম্মদপুর, ঢাকা<br className="sm:hidden" /> | © {new Date().getFullYear()} IPonion. All rights reserved.
          </div>
        </div>
      </footer>

      {/* BOOKING SUCCESS POPUP MODAL */}
      {showModal && bookingData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-xl font-black text-slate-900">বুকিং সফল হয়েছে!</h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              আপনার সার্ভিস রিকোয়েস্টটি আমাদের সেন্টারে গৃহীত হয়েছে। খুব দ্রুত আমাদের টেকনিক্যাল টিম আপনার সাথে যোগাযোগ করবে।
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl text-left text-xs space-y-1.5 mb-5 border border-slate-100">
              <p><strong className="text-slate-800">সার্ভিস:</strong> {bookingData.service_title}</p>
              <p><strong className="text-slate-800">কাস্টমার:</strong> {bookingData.customer_name}</p>
              <p><strong className="text-slate-800">মোবাইল:</strong> {bookingData.customer_phone}</p>
              <p><strong className="text-slate-800">ঠিকানা:</strong> {bookingData.customer_address}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs"
              >
                ঠিক আছে
              </button>
              <Link
                href="/auth"
                className="flex-1 py-3 bg-[#2D1457] hover:bg-[#3d1c75] text-white rounded-xl font-bold text-xs"
              >
                পোর্টালে দেখুন
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
