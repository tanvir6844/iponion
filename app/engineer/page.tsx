"use client";

import { useState, useEffect } from "react";
import IponionLogo from "@/components/Logo";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, Calendar, CheckCircle2, Wrench, Shield, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const ENGINEERS = [
  { name: "Tanvir Ahmed", phone: "01991477412" },
  { name: "Rahim Islam", phone: "01711000001" },
  { name: "Kamal Hossain", phone: "01811000002" },
  { name: "Sabbir Hossain", phone: "01911000003" }
];

export default function EngineerPortal() {
  const [activeEngineer, setActiveEngineer] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"my" | "all">("my");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEng = localStorage.getItem("iponion_active_engineer");
      if (savedEng) {
        try {
          setActiveEngineer(JSON.parse(savedEng));
        } catch (e) {}
      }
    }
    fetchBookings();
  }, []);

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

  const handleSelectEngineer = (eng: any) => {
    setActiveEngineer(eng);
    localStorage.setItem("iponion_active_engineer", JSON.stringify(eng));
  };

  // Mark task as Completed / In Progress
  const updateTaskStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      // 1. Update Supabase
      await supabase.from("bookings").update({
        status: newStatus,
        completed_at: newStatus === "Completed" ? new Date().toISOString() : null
      }).eq("id", bookingId);

      // 2. Update Local state
      const updated = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
      setBookings(updated);
      localStorage.setItem("iponion_bookings", JSON.stringify(updated));

      alert(`✅ স্ট্যাটাস সফলভাবে '${newStatus}' আপডেট হয়েছে! কাস্টমার পোর্টালে সাথে সাথে আপডেট দেখতে পাবেন।`);
    } catch (err) {
      console.error(err);
      alert("আপডেট করার সময় সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setUpdatingId(null);
    }
  };

  const displayedBookings = bookings.filter(b => {
    if (filterMode === "my" && activeEngineer) {
      return b.engineer_name === activeEngineer.name;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      {/* Header */}
      <header className="bg-[#2D1457] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><IponionLogo size="sm" /></Link>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-lime-400 text-slate-900 px-2 py-0.5 rounded font-bold">ইঞ্জিনিয়ার পোর্টাল</span>
            {activeEngineer && (
              <button
                onClick={() => {
                  localStorage.removeItem("iponion_active_engineer");
                  setActiveEngineer(null);
                }}
                className="text-[11px] text-slate-300 hover:text-white underline ml-2"
              >
                বদলান
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-5">
        {/* ENGINEER SELECTION IF NOT LOGGED IN */}
        {!activeEngineer ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
            <div className="w-12 h-12 bg-violet-100 text-[#2D1457] rounded-full flex items-center justify-center mx-auto mb-3">
              <Wrench size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">ইঞ্জিনিয়ার সিলেক্ট করুন</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">আপনার আজকের অ্যাসাইন করা কাজের তালিকা ও স্ট্যাটাস আপডেট করতে নিজের নাম বেছে নিন:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ENGINEERS.map((eng) => (
                <button
                  key={eng.name}
                  onClick={() => handleSelectEngineer(eng)}
                  className="p-4 border-2 border-slate-200 hover:border-violet-600 rounded-xl text-left bg-slate-50 hover:bg-violet-50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-violet-900">{eng.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{eng.phone}</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Logged in Engineer Banner */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ফিল্ড ইঞ্জিনিয়ার</span>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  {activeEngineer.name}
                  <span className="text-xs font-normal text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-sans">অন-ডিউটি</span>
                </h2>
                <p className="text-xs text-slate-500 font-mono">{activeEngineer.phone}</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setFilterMode("my")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    filterMode === "my" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  আমার কাজ
                </button>
                <button
                  onClick={() => setFilterMode("all")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    filterMode === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  সকল কাজ ({bookings.length})
                </button>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-4">
              {displayedBookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
                  <p className="text-sm">এই মুহূর্তে কোনো কাজ অ্যাসাইন করা নেই।</p>
                </div>
              ) : (
                displayedBookings.map((b) => {
                  const isCompleted = b.status === "Completed" || b.status === "সম্পন্ন";
                  const cleanPhone = (b.customer_phone || "").replace(/^0/, "");

                  return (
                    <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                            {b.service_title}
                          </span>
                          <h3 className="font-bold text-slate-900 text-base mt-1.5">{b.customer_name}</h3>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {b.status || "Pending"}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 text-xs text-slate-600 my-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-rose-500 flex-shrink-0" />
                          <span className="font-semibold text-slate-800">ঠিকানা:</span> {b.customer_address || b.area || "Dhaka"}
                        </p>
                        {b.problem_desc && (
                          <p className="text-slate-700 italic pt-1 border-t border-slate-200/60 mt-1">
                            &quot;{b.problem_desc}&quot;
                          </p>
                        )}
                      </div>

                      {/* Communication & Maps Buttons */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <a
                          href={`tel:${b.customer_phone}`}
                          className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Phone size={13} className="text-emerald-600" /> কল
                        </a>
                        <a
                          href={`https://wa.me/880${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.customer_address || b.area || "Dhaka")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <MapPin size={13} /> গুগল ম্যাপ
                        </a>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        {isCompleted ? (
                          <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                            <CheckCircle2 size={16} /> কাজ সম্পন্ন হয়েছে (Done)
                          </div>
                        ) : (
                          <div className="w-full flex items-center gap-2">
                            {b.status !== "In Progress" && (
                              <button
                                onClick={() => updateTaskStatus(b.id, "In Progress")}
                                disabled={updatingId === b.id}
                                className="w-1/3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all"
                              >
                                🚀 শুরু করেছি
                              </button>
                            )}
                            <button
                              onClick={() => updateTaskStatus(b.id, "Completed")}
                              disabled={updatingId === b.id}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Check size={16} /> ✅ কাজ সম্পন্ন (Mark as Done)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
