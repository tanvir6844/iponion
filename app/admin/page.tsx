"use client";

import { useState, useEffect } from "react";
import IponionLogo from "@/components/Logo";
import Link from "next/link";
import { 
  Phone, MessageCircle, MapPin, Search, RefreshCw, LogOut, CheckCircle, 
  Clock, Star, Send, Trash2, Edit3, Users, Shield, Plus, X, Wrench, Mail
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"bookings" | "users">("bookings");

  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>("এইমাত্র");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("iponion_admin_auth");
      if (savedAuth === "true") {
        setAuth(true);
      }
    }
  }, []);

  // Real-time Background Polling Every 3 Seconds
  useEffect(() => {
    if (!auth) return;
    loadAllData(true);
    const interval = setInterval(() => {
      loadAllData(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [auth]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1991" || pin === "1122" || pin === "admin") {
      setAuth(true);
      localStorage.setItem("iponion_admin_auth", "true");
    } else {
      alert("ভুল পিন কোড! সঠিক পিন: 1991");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("iponion_admin_auth");
    setAuth(false);
  };

  const loadAllData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);

    try {
      // 1. Fetch all bookings from Supabase
      const { data: dbBookings } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      let currentBookings = dbBookings || [];
      if (currentBookings.length === 0) {
        const local = localStorage.getItem("iponion_bookings");
        if (local) currentBookings = JSON.parse(local);
      }
      setBookings(currentBookings);

      // 2. Build Centralized Customer Database
      const uniqueUsersMap = new Map();

      // Extract from Supabase customers table if present
      try {
        const { data: dbCustomers } = await supabase.from("customers").select("*");
        if (dbCustomers) {
          dbCustomers.forEach(c => uniqueUsersMap.set(c.phone, c));
        }
      } catch (e) {}

      // Extract from all bookings & registrations (GUARANTEED ACROSS ALL DEVICES!)
      currentBookings.forEach((b: any) => {
        if (b.customer_phone && !uniqueUsersMap.has(b.customer_phone)) {
          uniqueUsersMap.set(b.customer_phone, {
            name: b.customer_name || "সম্মানিত গ্রাহক",
            phone: b.customer_phone,
            email: b.customer_email || `${b.customer_phone}@customer.iponion.com`,
            address: b.customer_address || b.area || "Dhaka",
            registered_at: b.created_at
          });
        }
      });

      // Extract from local registered list
      try {
        const localUsers = localStorage.getItem("iponion_registered_customers");
        if (localUsers) {
          const parsed = JSON.parse(localUsers);
          parsed.forEach((u: any) => {
            if (!uniqueUsersMap.has(u.phone)) uniqueUsersMap.set(u.phone, u);
          });
        }
      } catch (e) {}

      setUsers(Array.from(uniqueUsersMap.values()));
      setLastSynced(new Date().toLocaleTimeString('bn-BD'));
    } catch (err) {
      console.error(err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    try {
      await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
    } catch (e) {}
  };

  const assignEngineer = async (booking: any, eng: any) => {
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, engineer_name: eng.name, engineer_phone: eng.phone, status: "In Progress" } : b));
    try {
      await supabase.from("bookings").update({
        engineer_name: eng.name,
        engineer_phone: eng.phone,
        status: "In Progress"
      }).eq("id", booking.id);
    } catch (e) {}

    const msg = encodeURIComponent(`🚨 IPonion নতুন টাস্ক:\nকাস্টমার: ${booking.customer_name}\nফোন: ${booking.customer_phone}\nসার্ভিস: ${booking.service_title}\nঠিকানা: ${booking.customer_address || booking.area}`);
    window.open(`https://wa.me/880${eng.phone.replace(/^0/, "")}?text=${msg}`, "_blank");
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("⚠️ আপনি কি নিশ্চিতভাবে এই বুকিংটি মুছে ফেলতে চান?")) return;
    setBookings(prev => prev.filter(b => b.id !== id));
    try {
      await supabase.from("bookings").delete().eq("id", id);
    } catch (err) {}
  };

  const handleDeleteUser = async (phone: string) => {
    if (!confirm(`⚠️ আপনি কি নিশ্চিতভাবে কাস্টমার (${phone}) অ্যাকাউন্টটি পার্মানেন্টলি ডিলিট করতে চান?`)) return;
    setUsers(prev => prev.filter(u => u.phone !== phone));
    try {
      await supabase.from("customers").delete().eq("phone", phone);
      await supabase.from("bookings").delete().eq("customer_phone", phone);
    } catch (err) {}
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-3xl max-w-sm w-full border border-slate-700 shadow-2xl text-center">
          <IponionLogo size="lg" className="justify-center mb-6" />
          <h2 className="text-xl font-bold text-white mb-1">অ্যাডমিন সুপার কন্ট্রোল</h2>
          <p className="text-xs text-slate-400 mb-6">ফুল অ্যাক্সেসের জন্য ৪ ডিজিটের পিন কোড দিন</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="পিন: 1991"
            className="w-full py-3.5 px-4 bg-slate-900 border border-slate-700 rounded-xl text-white text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4 font-mono"
          />
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl shadow-lg transition-all text-sm">
            প্রবেশ করুন (Login)
          </button>
        </form>
      </div>
    );
  }

  const filteredBookings = bookings.filter(b => {
    const isRegistrationRow = b.service_title === "Customer Registration" || b.service_title === "Customer Registration (নতুন গ্রাহক)";
    const matchesSearch = (b.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (b.customer_phone || "").includes(search) ||
                          (b.service_title || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return !isRegistrationRow && matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(u => {
    return (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
           (u.phone || "").includes(search) ||
           (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
           (u.address || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/"><IponionLogo size="sm" /></Link>
            <span className="text-xs font-black bg-violet-100 text-[#2D1457] px-2.5 py-1 rounded-full flex items-center gap-1 border border-violet-200">
              <Shield size={13} /> সুপার অ্যাডমিন
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              অটো-সিঙ্ক সক্রিয় ({lastSynced})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/engineer" target="_blank" className="text-xs font-bold text-lime-700 bg-lime-100 hover:bg-lime-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Wrench size={13} /> ইঞ্জিনিয়ার পোর্টাল ↗
            </Link>
            <button onClick={() => loadAllData(true)} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={handleLogout} className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1">
              <LogOut size={13} /> লগআউট
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">মোট সার্ভিস বুকিং</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{filteredBookings.length}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm">
            <p className="text-xs text-amber-800 font-medium">অপেক্ষমান / চলমান</p>
            <p className="text-2xl font-black text-amber-700 mt-1">
              {filteredBookings.filter(b => b.status !== "Completed" && b.status !== "সম্পন্ন").length}
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm">
            <p className="text-xs text-emerald-800 font-medium">সম্পন্ন কাজ</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {filteredBookings.filter(b => b.status === "Completed" || b.status === "সম্পন্ন").length}
            </p>
          </div>
          <div className="bg-violet-50 p-4 rounded-2xl border border-violet-200 shadow-sm">
            <p className="text-xs text-violet-800 font-medium">মোট কাস্টমার ডাটাবেজ</p>
            <p className="text-2xl font-black text-violet-700 mt-1">{users.length}</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 w-fit mb-6">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "bookings" ? "bg-[#2D1457] text-white shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📋 বুকিং ও সার্ভিস ({filteredBookings.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "users" ? "bg-[#2D1457] text-white shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users size={15} /> 👥 কাস্টমার ডাটাবেজ ({users.length})
          </button>
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="কাস্টমার নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
          </div>

          {activeTab === "bookings" && (
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              {["all", "Pending", "In Progress", "Completed"].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st ? "bg-[#2D1457] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st === "all" ? "সকল বুকিং" : st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: BOOKINGS LIST */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border border-slate-200">
                কোনো সার্ভিস বুকিং রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              filteredBookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-md">
                          {b.service_title}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          b.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                          b.status === "In Progress" ? "bg-amber-100 text-amber-800" :
                          "bg-sky-100 text-sky-800"
                        }`}>
                          {b.status || "Pending"}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 mt-1">{b.customer_name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{b.customer_phone} • {b.customer_email || "N/A"}</p>
                      
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                        <MapPin size={13} className="text-rose-500 flex-shrink-0" />
                        <span>{b.customer_address || b.area}</span>
                      </p>

                      {b.problem_desc && (
                        <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2 italic">
                          &quot;{b.problem_desc}&quot;
                        </p>
                      )}

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

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[260px] pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">স্ট্যাটাস পরিবর্তন</label>
                        <select
                          value={b.status || "Pending"}
                          onChange={(e) => updateStatus(b.id, e.target.value)}
                          className="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">ইঞ্জিনিয়ার নিয়োগ</label>
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            const eng = ENGINEERS.find(en => en.name === e.target.value);
                            if (eng) assignEngineer(b, eng);
                          }}
                          className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-xl bg-white focus:outline-none"
                        >
                          <option value="" disabled>{b.engineer_name ? `বর্তমান: ${b.engineer_name}` : "ইঞ্জিনিয়ার নির্বাচন করুন"}</option>
                          {ENGINEERS.map(eng => (
                            <option key={eng.name} value={eng.name}>{eng.name} ({eng.phone})</option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 flex items-center justify-center gap-1"
                        >
                          <Trash2 size={13} /> বুকিং মুছুন
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: CENTRAL CUSTOMER DATABASE */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">কাস্টমার নাম</th>
                    <th className="p-4">মোবাইল নম্বর</th>
                    <th className="p-4">ইমেইল</th>
                    <th className="p-4">ঠিকানা</th>
                    <th className="p-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">কোনো কাস্টমার অ্যাকাউন্ট পাওয়া যায়নি।</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-violet-100 text-[#2D1457] flex items-center justify-center font-black text-xs">
                              {(u.name || "C")[0]}
                            </div>
                            <span>{u.name || "সম্মানিত গ্রাহক"}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-emerald-600" />
                            <span>{u.phone}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-400" />
                            <span>{u.email || "N/A"}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-rose-500" />
                            <span>{u.address || "Dhaka"}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(u.phone)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition-colors"
                            title="কাস্টমার ডিলিট করুন"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
