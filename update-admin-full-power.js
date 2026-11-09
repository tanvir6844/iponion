const fs = require('fs');
const path = require('path');

const adminFullPowerPage = `"use client";

import { useState, useEffect } from "react";
import IponionLogo from "@/components/Logo";
import Link from "next/link";
import { 
  Phone, MessageCircle, MapPin, Search, RefreshCw, LogOut, CheckCircle, 
  Clock, Star, Send, Trash2, Edit3, Users, Shield, Plus, X, AlertTriangle, 
  CheckCircle2, Wrench, Mail, Calendar
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit Booking Modal
  const [editingBooking, setEditingBooking] = useState<any | null>(null);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("iponion_admin_auth");
      if (savedAuth === "true") {
        setAuth(true);
        loadAllData();
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1991" || pin === "1122" || pin === "admin") {
      setAuth(true);
      localStorage.setItem("iponion_admin_auth", "true");
      loadAllData();
    } else {
      alert("ভুল পিন কোড! সঠিক পিন: 1991");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("iponion_admin_auth");
    setAuth(false);
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchBookings(), fetchUsers()]);
    setLoading(false);
  };

  const fetchBookings = async () => {
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
      const local = localStorage.getItem("iponion_bookings");
      if (local) setBookings(JSON.parse(local));
    }
  };

  const fetchUsers = async () => {
    try {
      let registeredList: any[] = [];
      const localUsers = localStorage.getItem("iponion_registered_customers");
      if (localUsers) {
        try { registeredList = JSON.parse(localUsers); } catch (e) {}
      }

      // Also try fetching from Supabase customers table
      const { data } = await supabase.from("customers").select("*");
      if (data && data.length > 0) {
        // Merge without duplicates by phone
        data.forEach(dbUser => {
          if (!registeredList.some(u => u.phone === dbUser.phone)) {
            registeredList.push(dbUser);
          }
        });
      }

      // Also extract unique customers from bookings who haven't registered
      const bookingsLocal = localStorage.getItem("iponion_bookings");
      if (bookingsLocal) {
        try {
          const allB = JSON.parse(bookingsLocal);
          allB.forEach((b: any) => {
            if (b.customer_phone && !registeredList.some(u => u.phone === b.customer_phone)) {
              registeredList.push({
                name: b.customer_name || "সম্মানিত গ্রাহক",
                phone: b.customer_phone,
                email: b.customer_email || \`\${b.customer_phone}@customer.iponion.com\`,
                address: b.customer_address || b.area || "Dhaka",
                registered_at: b.created_at
              });
            }
          });
        } catch (e) {}
      }

      setUsers(registeredList);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. DELETE BOOKING (ADMIN POWER)
  const handleDeleteBooking = async (id: string) => {
    if (!confirm("⚠️ আপনি কি নিশ্চিতভাবে এই বুকিংটি মুছে ফেলতে চান?")) return;
    try {
      await supabase.from("bookings").delete().eq("id", id);
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      localStorage.setItem("iponion_bookings", JSON.stringify(updated));
      alert("✅ বুকিংটি সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  // 2. SAVE EDITED BOOKING
  const handleSaveBookingEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      await supabase.from("bookings").update({
        customer_name: editingBooking.customer_name,
        customer_phone: editingBooking.customer_phone,
        customer_address: editingBooking.customer_address,
        service_title: editingBooking.service_title,
        problem_desc: editingBooking.problem_desc,
        status: editingBooking.status,
        engineer_name: editingBooking.engineer_name,
        engineer_phone: editingBooking.engineer_phone
      }).eq("id", editingBooking.id);

      const updated = bookings.map(b => b.id === editingBooking.id ? editingBooking : b);
      setBookings(updated);
      localStorage.setItem("iponion_bookings", JSON.stringify(updated));
      setEditingBooking(null);
      alert("✅ বুকিং তথ্য সফলভাবে আপডেট হয়েছে!");
    } catch (err) {
      alert("আপডেট করার সময় সমস্যা হয়েছে।");
    }
  };

  // 3. DELETE USER (ADMIN POWER)
  const handleDeleteUser = async (phone: string) => {
    if (!confirm(\`⚠️ আপনি কি নিশ্চিতভাবে কাস্টমার (\${phone}) অ্যাকাউন্টটি পার্মানেন্টলি ডিলিট করতে চান?\`)) return;

    try {
      await supabase.from("customers").delete().eq("phone", phone);
      const updated = users.filter(u => u.phone !== phone);
      setUsers(updated);
      localStorage.setItem("iponion_registered_customers", JSON.stringify(updated));
      alert("✅ কাস্টমার অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      alert("ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  // 4. SAVE EDITED USER
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await supabase.from("customers").update({
        name: editingUser.name,
        phone: editingUser.phone,
        email: editingUser.email,
        address: editingUser.address
      }).eq("phone", editingUser.phone);

      const updated = users.map(u => u.phone === editingUser.phone ? editingUser : u);
      setUsers(updated);
      localStorage.setItem("iponion_registered_customers", JSON.stringify(updated));
      setEditingUser(null);
      alert("✅ কাস্টমার তথ্য সফলভাবে আপডেট হয়েছে!");
    } catch (err) {
      alert("আপডেট করতে সমস্যা হয়েছে।");
    }
  };

  // 5. ADD NEW USER
  const handleAddNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserPhone.trim() || !newUserName.trim()) {
      alert("নাম ও মোবাইল নম্বর পূরণ করুন।");
      return;
    }

    const newUserObj = {
      name: newUserName.trim(),
      phone: newUserPhone.trim(),
      email: newUserEmail.trim() || \`\${newUserPhone.trim()}@customer.iponion.com\`,
      address: newUserAddress.trim() || "Dhaka",
      registered_at: new Date().toISOString()
    };

    try {
      await supabase.from("customers").insert([newUserObj]);
    } catch (e) {}

    const updated = [newUserObj, ...users];
    setUsers(updated);
    localStorage.setItem("iponion_registered_customers", JSON.stringify(updated));

    setShowAddUserModal(false);
    setNewUserName("");
    setNewUserPhone("");
    setNewUserEmail("");
    setNewUserAddress("");
    alert("✅ নতুন কাস্টমার সফলভাবে যোগ করা হয়েছে!");
  };

  // Quick Status Updater
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

  // Quick Engineer Assign
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

      // Dispatch WhatsApp task message to engineer
      const msg = encodeURIComponent(
        \`🚨 IPonion নতুন সার্ভিস টাস্ক:\\nকাস্টমার: \${booking.customer_name}\\nফোন: \${booking.customer_phone}\\nসার্ভিস: \${booking.service_title}\\nঠিকানা: \${booking.customer_address || booking.area}\\nনোট: \${booking.problem_desc || "N/A"}\`
      );
      window.open(\`https://wa.me/880\${eng.phone.replace(/^0/, "")}?text=\${msg}\`, "_blank");
    } catch (err) {}
  };

  // PIN LOGIN SCREEN
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

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = (b.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (b.customer_phone || "").includes(search) ||
                          (b.service_title || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Users
  const filteredUsers = users.filter(u => {
    return (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
           (u.phone || "").includes(search) ||
           (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
           (u.address || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/"><IponionLogo size="sm" /></Link>
            <span className="text-xs font-black bg-violet-100 text-[#2D1457] px-2.5 py-1 rounded-full flex items-center gap-1 border border-violet-200">
              <Shield size={13} /> সুপার অ্যাডমিন
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/engineer" target="_blank" className="text-xs font-bold text-lime-700 bg-lime-100 hover:bg-lime-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Wrench size={13} /> ইঞ্জিনিয়ার পোর্টাল ↗
            </Link>
            <button onClick={loadAllData} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={handleLogout} className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1">
              <LogOut size={13} /> লগআউট
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">মোট সার্ভিস বুকিং</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{bookings.length}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm">
            <p className="text-xs text-amber-800 font-medium">অপেক্ষমান / চলমান</p>
            <p className="text-2xl font-black text-amber-700 mt-1">
              {bookings.filter(b => b.status !== "Completed" && b.status !== "সম্পন্ন").length}
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm">
            <p className="text-xs text-emerald-800 font-medium">সম্পন্ন হয়েছে</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {bookings.filter(b => b.status === "Completed" || b.status === "সম্পন্ন").length}
            </p>
          </div>
          <div className="bg-violet-50 p-4 rounded-2xl border border-violet-200 shadow-sm">
            <p className="text-xs text-violet-800 font-medium">মোট কাস্টমার</p>
            <p className="text-2xl font-black text-violet-700 mt-1">{users.length}</p>
          </div>
        </div>

        {/* MAIN NAVIGATION TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 w-fit">
            <button
              onClick={() => setActiveTab("bookings")}
              className={\`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 \${
                activeTab === "bookings" ? "bg-[#2D1457] text-white shadow" : "text-slate-600 hover:text-slate-900"
              }\`}
            >
              📋 বুকিং ও সার্ভিস ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={\`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 \${
                activeTab === "users" ? "bg-[#2D1457] text-white shadow" : "text-slate-600 hover:text-slate-900"
              }\`}
            >
              <Users size={15} /> কাস্টমার ডাটাবেজ ({users.length})
            </button>
          </div>

          {/* Action buttons */}
          {activeTab === "users" && (
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all w-fit"
            >
              <Plus size={16} /> নতুন কাস্টমার যোগ করুন
            </button>
          )}
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === "bookings" ? "কাস্টমার নাম, ফোন বা সার্ভিস দিয়ে খুঁজুন..." : "কাস্টমার নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন..."}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
          </div>

          {activeTab === "bookings" && (
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
              {["all", "Pending", "In Progress", "Completed"].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={\`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all \${
                    statusFilter === st
                      ? "bg-[#2D1457] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }\`}
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
                কোনো বুকিং রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              filteredBookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-slate-300 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Customer & Job details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-md">
                          {b.service_title}
                        </span>
                        <span className={\`text-xs font-bold px-2.5 py-0.5 rounded-full \${
                          b.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                          b.status === "In Progress" ? "bg-amber-100 text-amber-800" :
                          "bg-sky-100 text-sky-800"
                        }\`}>
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

                      {/* Customer Review display */}
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

                    {/* Admin Action Controls */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[260px] pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {/* Status Changer */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">স্ট্যাটাস</label>
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
                        <label className="text-[10px] font-bold text-slate-400 uppercase">ইঞ্জিনিয়ার নিয়োগ</label>
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            const eng = ENGINEERS.find(en => en.name === e.target.value);
                            if (eng) assignEngineer(b, eng);
                          }}
                          className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white focus:outline-none"
                        >
                          <option value="" disabled>{b.engineer_name ? \`বর্তমান: \${b.engineer_name}\` : "ইঞ্জিনিয়ার নির্বাচন করুন"}</option>
                          {ENGINEERS.map(eng => (
                            <option key={eng.name} value={eng.name}>{eng.name} ({eng.phone})</option>
                          ))}
                        </select>
                      </div>

                      {/* Edit & Delete Booking Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setEditingBooking(b)}
                          className="flex-1 py-1.5 px-3 bg-violet-50 hover:bg-violet-100 text-violet-800 rounded-lg text-xs font-bold border border-violet-200 flex items-center justify-center gap-1"
                        >
                          <Edit3 size={13} /> এডিট
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 flex items-center justify-center gap-1"
                        >
                          <Trash2 size={13} /> মুছুন
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: USERS DATABASE (FULL POWER) */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border border-slate-200">
                কোনো কাস্টমার অ্যাকাউন্ট পাওয়া যায়নি।
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                        <th className="p-4">কাস্টমার নাম</th>
                        <th className="p-4">মোবাইল নম্বর</th>
                        <th className="p-4">ইমেইল</th>
                        <th className="p-4">ঠিকানা</th>
                        <th className="p-4 text-center">অ্যাকশন (পাওয়ার)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-violet-100 text-[#2D1457] flex items-center justify-center font-bold text-xs">
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
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg border border-violet-200 transition-colors"
                                title="কাস্টমার তথ্য এডিট করুন"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.phone)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition-colors"
                                title="কাস্টমার পার্মানেন্টলি ডিলিট করুন"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: EDIT BOOKING */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingBooking(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-lg font-black text-slate-900 mb-4">বুকিং তথ্য এডিট করুন</h3>

            <form onSubmit={handleSaveBookingEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">কাস্টমার নাম:</label>
                <input
                  type="text"
                  value={editingBooking.customer_name}
                  onChange={(e) => setEditingBooking({ ...editingBooking, customer_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={editingBooking.customer_phone}
                  onChange={(e) => setEditingBooking({ ...editingBooking, customer_phone: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">সার্ভিস নাম:</label>
                <input
                  type="text"
                  value={editingBooking.service_title}
                  onChange={(e) => setEditingBooking({ ...editingBooking, service_title: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ঠিকানা / এলাকা:</label>
                <input
                  type="text"
                  value={editingBooking.customer_address || editingBooking.area}
                  onChange={(e) => setEditingBooking({ ...editingBooking, customer_address: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">সমস্যার নোট:</label>
                <textarea
                  rows={2}
                  value={editingBooking.problem_desc || ""}
                  onChange={(e) => setEditingBooking({ ...editingBooking, problem_desc: e.target.value })}
                  className="w-full p-2.5 border rounded-xl resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">স্ট্যাটাস:</label>
                  <select
                    value={editingBooking.status}
                    onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-white font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ইঞ্জিনিয়ার:</label>
                  <input
                    type="text"
                    value={editingBooking.engineer_name || ""}
                    onChange={(e) => setEditingBooking({ ...editingBooking, engineer_name: e.target.value })}
                    placeholder="ইঞ্জিনিয়ার নাম"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#2D1457] hover:bg-[#3d1c75] text-white rounded-xl font-bold shadow-md"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative">
            <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-lg font-black text-slate-900 mb-4">কাস্টমার তথ্য পরিবর্তন করুন</h3>

            <form onSubmit={handleSaveUserEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">কাস্টমার নাম:</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-3 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full p-3 border rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ইমেইল:</label>
                <input
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ঠিকানা / এলাকা:</label>
                <input
                  type="text"
                  value={editingUser.address || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  className="w-full p-3 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#2D1457] hover:bg-[#3d1c75] text-white rounded-xl font-bold shadow-md"
                >
                  আপডেট সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative">
            <button onClick={() => setShowAddUserModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-lg font-black text-slate-900 mb-4">নতুন কাস্টমার যোগ করুন</h3>

            <form onSubmit={handleAddNewUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">পুরো নাম *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full p-3 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full p-3 border rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ইমেইল (ঐচ্ছিক)</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full p-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ঠিকানা / এলাকা</label>
                <input
                  type="text"
                  value={newUserAddress}
                  onChange={(e) => setNewUserAddress(e.target.value)}
                  placeholder="যেমন: বসিলা, মোহাম্মদপুর"
                  className="w-full p-3 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                >
                  কাস্টমার তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'app/admin/page.tsx'), adminFullPowerPage, 'utf8');
console.log('✓ app/admin/page.tsx updated with Super Admin Full Power (Edit, Delete, Customer Database)!');
