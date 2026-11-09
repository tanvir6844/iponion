"use client";
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
                      <a href={`tel:${b.customer_phone}`} className="font-mono text-[#5894FF] font-bold block">
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
                    href={`tel:${b.customer_phone}`}
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
