"use client";

import { useState, useEffect } from "react";
import IponionLogo from "@/components/Logo";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, Search, RefreshCw, LogOut, CheckCircle, Clock, Star, Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const ENGINEERS = [
  { name: "Tanvir Ahmed", phone: "01991477412" },
  { name: "Rahim Islam", phone: "01711000001" },
  { name: "Kamal Hossain", phone: "01811000002" },
  { name: "Sabbir Hossain", phone: "01911000003" }
];

export default function AdminDashboard() {
  const [auth, setAuth] = useState(false);
  const [pin, setPin] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("iponion_admin_auth");
      if (savedAuth === "true") {
        setAuth(true);
        fetchBookings();
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1991" || pin === "1122" || pin === "admin") {
      setAuth(true);
      localStorage.setItem("iponion_admin_auth", "true");
      fetchBookings();
    } else {
      alert("ভুল পিন কোড! দয়া করে সঠিক পিন দিন।");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("iponion_admin_auth");
    setAuth(false);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setBookings(data);
      } else {
        const local = localStorage.getItem("iponion_bookings");
        if (local) setBookings(JSON.parse(local));
      }
    } catch (err) {
      console.error(err);
      const local = localStorage.getItem("iponion_bookings");
      if (local) setBookings(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
      const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
      setBookings(updated);
      localStorage.setItem("iponion_bookings", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const assignEngineer = async (booking: any, eng: any) => {
    try {
      await supabase.from("bookings").update({
        engineer_name: eng.name,
        engineer_phone: eng.phone,
        status: "In Progress"
      }).eq("id", booking.id);

      const updated = bookings.map(b => b.id === booking.id ? {
        ...b,
        engineer_name: eng.name,
        engineer_phone: eng.phone,
        status: "In Progress"
      } : b);
      setBookings(updated);
      localStorage.setItem("iponion_bookings", JSON.stringify(updated));

      // WhatsApp Task Dispatch Link to Engineer
      const msg = encodeURIComponent(
        `🚨 IPonion নতুন সার্ভিস টাস্ক:\nকাস্টমার: ${booking.customer_name}\nফোন: ${booking.customer_phone}\nসার্ভিস: ${booking.service_title}\nঠিকানা: ${booking.customer_address || booking.area}\nবিস্তারিত: ${booking.problem_desc || "N/A"}`
      );
      window.open(`https://wa.me/880${eng.phone.replace(/^0/, "")}?text=${msg}`, "_blank");
    } catch (err) {
      console.error(err);
    }
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl max-w-sm w-full border border-slate-700 shadow-2xl text-center">
          <IponionLogo size="lg" className="justify-center mb-6" />
          <h2 className="text-xl font-bold text-white mb-2">অ্যাডমিন কন্ট্রোল প্যানেল</h2>
          <p className="text-xs text-slate-400 mb-6">সুরক্ষিত অ্যাক্সেসের জন্য ৪ ডিজিটের পিন কোড দিন</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="পিন কোড লিখুন"
            className="w-full py-3 px-4 bg-slate-900 border border-slate-700 rounded-xl text-white text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4"
          />
          <button type="submit" className="w-full py-3 bg-[#2D1457] hover:bg-[#3d1c75] text-white font-bold rounded-xl shadow-lg transition-all">
            প্রবেশ করুন
          </button>
        </form>
      </div>
    );
  }

  const filtered = bookings.filter(b => {
    const matchesSearch = (b.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (b.customer_phone || "").includes(search) ||
                          (b.service_title || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IponionLogo size="sm" />
            <span className="text-xs font-bold bg-violet-100 text-violet-800 px-2 py-0.5 rounded">অ্যাডমিন প্যানেল</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/engineer" target="_blank" className="text-xs font-semibold text-violet-700 hover:underline">
              ইঞ্জিনিয়ার পোর্টাল ↗
            </Link>
            <button onClick={fetchBookings} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={handleLogout} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {/* Controls */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="কাস্টমার নাম, ফোন বা সার্ভিস দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {["all", "Pending", "In Progress", "Completed"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === status
                    ? "bg-[#2D1457] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "all" ? "সকল বুকিং" : status}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table / Grid */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border border-slate-200">
              কোনো বুকিং পাওয়া যায়নি।
            </div>
          ) : (
            filtered.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Customer & Service info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded">
                        {b.service_title}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        b.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                        b.status === "In Progress" ? "bg-amber-100 text-amber-800" :
                        "bg-sky-100 text-sky-800"
                      }`}>
                        {b.status || "Pending"}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 mt-1">{b.customer_name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{b.customer_phone} • {b.customer_email || "N/A"}</p>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                      <MapPin size={12} className="text-rose-500" /> {b.customer_address || b.area}
                    </p>

                    {b.problem_desc && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2 italic">
                        &quot;{b.problem_desc}&quot;
                      </p>
                    )}

                    {/* Customer Review display if exists */}
                    {(b.customer_rating || b.customer_review) && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs">
                        <div className="flex items-center gap-1 font-bold text-amber-800 mb-0.5">
                          <Star size={13} className="fill-amber-500 text-amber-500" />
                          কাস্টমার রেটিং: {b.customer_rating}/5
                        </div>
                        {b.customer_review && (
                          <p className="text-slate-700 italic">&quot;{b.customer_review}&quot;</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions & Engineer assignment */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[260px]">
                    {/* Status Changer */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">স্ট্যাটাস পরিবর্তন</label>
                      <select
                        value={b.status || "Pending"}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    {/* Engineer Assignment */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">ইঞ্জিনিয়ার নিয়োগ করুন</label>
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const eng = ENGINEERS.find(en => en.name === e.target.value);
                          if (eng) assignEngineer(b, eng);
                        }}
                        className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white focus:outline-none"
                      >
                        <option value="" disabled>{b.engineer_name ? `বর্তমান: ${b.engineer_name}` : "ইঞ্জিনিয়ার নির্বাচন করুন"}</option>
                        {ENGINEERS.map(eng => (
                          <option key={eng.name} value={eng.name}>{eng.name} ({eng.phone})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
