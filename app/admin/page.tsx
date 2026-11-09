"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, Phone, Clock, Calendar, CheckCircle2, AlertCircle, 
  Trash2, Edit, RefreshCw, UserCheck, Wrench, Search, MapPin, Mail, LogOut,
  Users, BookOpen, X, Check
} from "lucide-react";
import IponionLogo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "customers">("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dbStatus, setDbStatus] = useState<string>("কানেক্ট হচ্ছে...");

  // ENGINEER ASSIGNMENT MODAL STATE
  const [assignModalBooking, setAssignModalBooking] = useState<any>(null);
  const [selectedEngId, setSelectedEngId] = useState("tanvir");
  const [customEngName, setCustomEngName] = useState("");
  const [customEngPhone, setCustomEngPhone] = useState("");

  const engineerList = [
    { id: "tanvir", name: "তানভীর আহমেদ (Lead)", phone: "01991477412", role: "নেটওয়ার্ক ও সার্ভার স্পেশালিস্ট" },
    { id: "rakib", name: "রাকিবুল হাসান", phone: "01791477412", role: "পিসি, ল্যাপটপ ও ওএস রিপেয়ার" },
    { id: "mehedi", name: "মেহেদী হাসান", phone: "01819477412", role: "সিসিটিভি ক্যামেরা ও ল্যান কেবলিং" }
  ];

  const loadAllData = async () => {
    let supaList: any[] = [];
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        supaList = data;
        setDbStatus(`🟢 ডাটাবেস সক্রিয় (${data.length}টি বুকিং সেন্ট্রাল স্টোরেজে আছে)`);
      } else if (error) {
        setDbStatus("⚠️ ডাটাবেস নোটিশ: " + error.message);
      }
    } catch (e: any) {
      setDbStatus("⚠️ " + (e?.message || "কানেকশন চেক করুন"));
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

    // Filter out permanently deleted IDs
    const delList = JSON.parse(localStorage.getItem("iponion_deleted_ids") || "[]");
    const activeBookings = merged.filter((b) => !delList.includes(String(b.id)));
    setBookings(activeBookings);

    // Extract Registered Customers List
    const customerMap = new Map();
    activeBookings.forEach((b) => {
      const key = b.customer_phone || b.customer_email || b.customer_name;
      if (key && !customerMap.has(key)) {
        customerMap.set(key, {
          name: b.customer_name || "সম্মানিত কাস্টমার",
          phone: b.customer_phone || "N/A",
          email: b.customer_email || "N/A",
          address: b.customer_address || b.area || "ঢাকা",
          totalBookings: 1,
          lastBookingDate: b.created_at || new Date().toISOString()
        });
      } else if (key && customerMap.has(key)) {
        const item = customerMap.get(key);
        item.totalBookings += 1;
      }
    });

    setCustomers(Array.from(customerMap.values()));
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const savedPin = localStorage.getItem("iponion_admin_pin");
    if (savedPin === "1991" || savedPin === "1234") {
      setIsAuthenticated(true);
      loadAllData();
    } else {
      setLoading(false);
    }

    const interval = setInterval(() => {
      if (localStorage.getItem("iponion_admin_pin") === "1991") {
        loadAllData();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1991" || pin === "1234") {
      localStorage.setItem("iponion_admin_pin", "1991");
      setIsAuthenticated(true);
      loadAllData();
    } else {
      alert("ভুল অ্যাডমিন পিন! অনুগ্রহ করে সঠিক পিন দিন।");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
    } catch (e) {}

    setBookings((prev) =>
      prev.map((b) => (String(b.id) === String(id) ? { ...b, status: newStatus } : b))
    );
  };

  // CONFIRM ENGINEER ASSIGNMENT
  const handleConfirmAssignment = async () => {
    if (!assignModalBooking) return;
    let engName = "";
    let engPhone = "";

    if (selectedEngId === "custom") {
      if (!customEngName.trim()) {
        alert("ইঞ্জিনিয়ারের নাম লিখুন");
        return;
      }
      engName = customEngName.trim();
      engPhone = customEngPhone.trim();
    } else {
      const eng = engineerList.find((x) => x.id === selectedEngId);
      if (eng) {
        engName = eng.name;
        engPhone = eng.phone;
      }
    }

    try {
      await supabase
        .from("bookings")
        .update({
          assigned_engineer_name: engName,
          assigned_engineer_phone: engPhone,
          status: "Assigned"
        })
        .eq("id", assignModalBooking.id);
    } catch (e) {}

    // Update localStorage
    try {
      const raw = localStorage.getItem("iponion_bookings");
      if (raw) {
        const list = JSON.parse(raw);
        const updated = list.map((b: any) =>
          String(b.id) === String(assignModalBooking.id)
            ? { ...b, assigned_engineer_name: engName, assigned_engineer_phone: engPhone, status: "Assigned" }
            : b
        );
        localStorage.setItem("iponion_bookings", JSON.stringify(updated));
      }
    } catch (e) {}

    setBookings((prev) =>
      prev.map((b) =>
        String(b.id) === String(assignModalBooking.id)
          ? { ...b, assigned_engineer_name: engName, assigned_engineer_phone: engPhone, status: "Assigned" }
          : b
      )
    );

    setAssignModalBooking(null);
    alert(`✅ ${engName}-কে সফলভাবে অ্যাসাইন করা হয়েছে!`);
  };

  // PERMANENT DELETE (SUPABASE + LOCALSTORAGE + BLACKLIST)
  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই বুকিংটি স্থায়ীভাবে মুছে ফেলতে চান?")) return;

    try {
      await supabase.from("bookings").delete().eq("id", id);
    } catch (e) {}

    try {
      const raw = localStorage.getItem("iponion_bookings");
      if (raw) {
        const list = JSON.parse(raw);
        const filtered = list.filter((b: any) => String(b.id) !== String(id));
        localStorage.setItem("iponion_bookings", JSON.stringify(filtered));
      }

      const delRaw = localStorage.getItem("iponion_deleted_ids") || "[]";
      const delList = JSON.parse(delRaw);
      if (!delList.includes(String(id))) {
        delList.push(String(id));
        localStorage.setItem("iponion_deleted_ids", JSON.stringify(delList));
      }
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

  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      (b.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.customer_phone || "").includes(search) ||
      (b.service_title || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredCustomers = customers.filter((c) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

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
              onClick={() => { setRefreshing(true); loadAllData(); }}
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
        {/* STATUS BAR */}
        <div className="mb-4 px-4 py-2 bg-white rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 flex items-center justify-between">
          <span>{dbStatus}</span>
          <span className="text-[11px] font-mono text-slate-400">অটো-সিঙ্ক: প্রতি ৩ সেকেন্ড</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#2D1457]">সেন্ট্রাল অ্যাডমিন কন্ট্রোল প্যানেল</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              বুকিং: <strong className="text-slate-800">{bookings.length} টি</strong> • রেজিস্টার্ড কাস্টমার: <strong className="text-slate-800">{customers.length} জন</strong>
            </p>
          </div>

          {/* TABS */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "bookings" ? "bg-[#2D1457] text-white shadow" : "text-slate-600 hover:text-slate-900"}`}
            >
              <BookOpen size={14} />
              <span>সার্ভিস বুকিং ({bookings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "customers" ? "bg-[#2D1457] text-white shadow" : "text-slate-600 hover:text-slate-900"}`}
            >
              <Users size={14} />
              <span>কাস্টমার ডাটাবেস ({customers.length})</span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম, ফোন বা সার্ভিস দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#5894FF]"
            />
          </div>

          {activeTab === "bookings" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="All">সব স্ট্যাটাস</option>
              <option value="Pending">⏳ Pending (অপেক্ষমান)</option>
              <option value="Confirmed">✓ Confirmed (নিশ্চিত)</option>
              <option value="Assigned">🔧 Assigned (ইঞ্জিনিয়ার নিযুক্ত)</option>
              <option value="Completed">✅ Completed (সম্পন্ন)</option>
              <option value="Cancelled">✕ Cancelled (বাতিল)</option>
            </select>
          )}
        </div>

        {/* TAB 1: BOOKINGS LIST */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <p className="text-sm font-bold text-slate-600">কোনো বুকিং পাওয়া যায়নি।</p>
                <p className="text-xs text-slate-400 mt-1">হোমপেইজ থেকে সার্ভিস বুক করা মাত্রই এখানে লাইভ চলে আসবে।</p>
              </div>
            ) : (
              filteredBookings.map((b) => (
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">গ্রাহকের প্রোফাইল</span>
                        <strong className="text-slate-900 text-sm block">{b.customer_name}</strong>
                        <a href={`tel:${b.customer_phone}`} className="font-mono text-[#5894FF] font-bold block mt-0.5">
                          📞 {b.customer_phone}
                        </a>
                        {b.customer_email && (
                          <span className="text-slate-500 font-mono text-[11px] block truncate">
                            ✉️ {b.customer_email}
                          </span>
                        )}
                      </div>

                      <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
                        <span className="text-blue-700 block text-[10px] uppercase font-black">📅 সার্ভিস শিডিউল</span>
                        <div className="mt-0.5">
                          <strong className="text-slate-900 block font-mono text-sm">
                            তারিখ: {b.booking_date || "তাৎক্ষণিক"}
                          </strong>
                          <span className="text-slate-600 block text-[11px] font-semibold">
                            সময়: {b.booking_time || "যেকোনো সময়"}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">📍 ঠিকানা ও সমস্যা</span>
                        <span className="text-slate-700 block truncate">{b.customer_address || b.area || "ঠিকানা দেওয়া হয়নি"}</span>
                        {b.problem_desc && (
                          <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1 italic">
                            "{b.problem_desc}"
                          </p>
                        )}
                      </div>
                    </div>

                    {b.assigned_engineer_name && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                        <div>
                          <strong>দায়িত্বপ্রাপ্ত ইঞ্জিনিয়ার:</strong> {b.assigned_engineer_name}
                          {b.assigned_engineer_phone && <span className="font-mono ml-2 font-bold">({b.assigned_engineer_phone})</span>}
                        </div>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                          অন-ডিউটি
                        </span>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock size={11} />
                      <span>রিকোয়েস্টের সময়: {b.created_at ? new Date(b.created_at).toLocaleString("bn-BD") : "N/A"}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => setAssignModalBooking(b)}
                      className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1"
                    >
                      <Wrench size={12} />
                      <span>{b.assigned_engineer_name ? "ইঞ্জিনিয়ার পরিবর্তন" : "ইঞ্জিনিয়ার অ্যাসাইন"}</span>
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
        )}

        {/* TAB 2: REGISTERED CUSTOMER DATABASE */}
        {activeTab === "customers" && (
          <div className="space-y-4">
            {filteredCustomers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <p className="text-sm font-bold text-slate-600">কোনো গ্রাহকের ডাটা পাওয়া যায়নি।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((c, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                          কাস্টমার #{idx + 1}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          মোট বুকিং: {c.totalBookings}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-[#2D1457]">{c.name}</h3>

                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-mono">
                          <Phone size={13} className="text-[#5894FF]" />
                          <strong>{c.phone}</strong>
                        </div>
                        {c.email && c.email !== "N/A" && (
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono truncate">
                            <Mail size={13} className="text-slate-400" />
                            <span>{c.email}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-1.5 text-slate-600">
                          <MapPin size={13} className="text-[#F53E00] shrink-0 mt-0.5" />
                          <span className="truncate">{c.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        সর্বশেষ সক্রিয়: {new Date(c.lastBookingDate).toLocaleDateString("bn-BD")}
                      </span>
                      {c.phone && c.phone !== "N/A" && (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${c.phone}`}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold"
                          >
                            কল
                          </a>
                          <a
                            href={`https://wa.me/880${c.phone.replace(/^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-green-500 text-white rounded-lg text-xs font-bold"
                          >
                            WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ENGINEER ASSIGNMENT MODAL */}
      {assignModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-[#2D1457]">ফিল্ড ইঞ্জিনিয়ার নির্বাচন করুন</h3>
                <p className="text-xs text-slate-500">
                  বুকিং: <strong className="text-slate-800">{assignModalBooking.service_title}</strong>
                </p>
              </div>
              <button
                onClick={() => setAssignModalBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <span className="text-xs font-bold text-slate-700 block">উপলব্ধ সার্টিফাইড ইঞ্জিনিয়ার তালিকা:</span>

              {engineerList.map((eng) => (
                <label
                  key={eng.id}
                  onClick={() => setSelectedEngId(eng.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${selectedEngId === eng.id ? "border-violet-600 bg-violet-50/60 shadow-sm" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedEngId === eng.id ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300"}`}>
                      {selectedEngId === eng.id && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{eng.name}</h4>
                      <p className="text-[11px] text-slate-500">{eng.role} • <strong className="font-mono text-slate-700">{eng.phone}</strong></p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    Active
                  </span>
                </label>
              ))}

              {/* Custom Engineer Option */}
              <label
                onClick={() => setSelectedEngId("custom")}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${selectedEngId === "custom" ? "border-violet-600 bg-violet-50/60" : "border-slate-200 hover:bg-slate-50"}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedEngId === "custom" ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300"}`}>
                  {selectedEngId === "custom" && <Check size={12} strokeWidth={3} />}
                </div>
                <span className="text-xs font-bold text-slate-800">অন্যান্য ইঞ্জিনিয়ার (নতুন নাম ও ফোন নম্বর দিন)</span>
              </label>

              {selectedEngId === "custom" && (
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <input
                    type="text"
                    value={customEngName}
                    onChange={(e) => setCustomEngName(e.target.value)}
                    placeholder="ইঞ্জিনিয়ারের নাম *"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    type="tel"
                    value={customEngPhone}
                    onChange={(e) => setCustomEngPhone(e.target.value)}
                    placeholder="ফোন নম্বর *"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirmAssignment}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                কনফার্ম ইঞ্জিনিয়ার অ্যাসাইন করুন
              </button>
              <button
                onClick={() => setAssignModalBooking(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
