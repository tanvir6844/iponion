"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Phone, Clock, CheckCircle2, AlertCircle, Wrench,
  Star, LogOut, ArrowRight, RefreshCw, MessageCircle, MapPin
} from "lucide-react";
import IponionLogo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { auth, signOut, onAuthStateChanged } from "@/lib/firebase";
export default function CustomerPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const normalizePhone = (num: string) => {
    let clean = (num || "").replace(/[^0-9]/g, "");
    if (clean.startsWith("880")) clean = clean.slice(2);
    if (!clean.startsWith("0") && clean.length === 10) clean = "0" + clean;
    return clean;
  };
  const loadData = async (currentUser: any) => {
    const cleanPhone = normalizePhone(currentUser.phone || "");
    const last10 = cleanPhone.slice(-10);
    const userEmail = (currentUser.email || "").trim().toLowerCase();
    let supaList: any[] = [];
    try {
      const orList: string[] = [];
      if (last10) orList.push(`customer_phone.ilike.%${last10}%`);
      if (userEmail) orList.push(`customer_email.eq.${userEmail}`);
      if (orList.length > 0) {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .or(orList.join(","))
          .order("created_at", { ascending: false });
        if (!error && data) supaList = data;
      }
    } catch (e) {
      console.warn("Supabase query error:", e);
    }
    let localList: any[] = [];
    try {
      const raw = localStorage.getItem("iponion_bookings");
      if (raw) {
        const allLocal = JSON.parse(raw);
        if (Array.isArray(allLocal)) {
          localList = allLocal.filter((b: any) => {
            const bPhone = normalizePhone(b.customer_phone || b.phone || "");
            const bEmail = (b.customer_email || "").toLowerCase();
            return (last10 && bPhone.endsWith(last10)) || (userEmail && bEmail === userEmail);
          });
        }
      }
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
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const u = {
          name: fbUser.displayName || "Customer",
          email: fbUser.email,
          phone: fbUser.phoneNumber || "",
          photoURL: fbUser.photoURL || "",
          role: "customer"
        };
        setUser(u);
        loadData(u);
      } else {
        const saved = localStorage.getItem("iponion_user");
        if (saved) {
          try {
            const u = JSON.parse(saved);
            setUser(u);
            loadData(u);
          } catch (e) {
            router.replace("/auth");
          }
        } else {
          router.replace("/auth");
        }
      }
    });
    return () => unsubscribe();
  }, [router]);
  const handleLogout = async () => {
    if (confirm("আপনি কি নিশ্চিত আপনার পোর্টাল থেকে লগআউট করতে চান?")) {
      try {
        await signOut(auth);
        localStorage.removeItem("iponion_user");
      } catch (e) {}
      router.replace("/auth");
    }
  };
  const handleManualRefresh = () => {
    if (!user) return;
    setRefreshing(true);
    loadData(user);
  };
  const handleSaveReview = async () => {
    if (!selectedBookingForReview) return;
    try {
      await supabase
        .from("bookings")
        .update({
          customer_rating: rating,
          customer_review: reviewComment,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", selectedBookingForReview.id);
    } catch (e) {}
    setReviewSubmitted(true);
    setTimeout(() => {
      setSelectedBookingForReview(null);
      setReviewSubmitted(false);
      if (user) loadData(user);
    }, 1500);
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">⏳ অপেক্ষমান (Pending)</span>;
      case "Confirmed":
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">✓ বুকিং নিশ্চিত (Confirmed)</span>;
      case "Assigned":
      case "In Progress":
        return <span className="px-2.5 py-1 bg-violet-100 text-violet-800 rounded-full text-xs font-bold">🔧 ইঞ্জিনিয়ার নিয়োজিত</span>;
      case "Completed":
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">✅ কাজ সম্পন্ন হয়েছে</span>;
      case "Cancelled":
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">✕ বাতিল (Cancelled)</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <IponionLogo size="md" />
          <p className="mt-4 text-sm font-semibold text-slate-600 animate-pulse">
            কাস্টমার পোর্টাল লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/"><IponionLogo size="sm" /></Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800">{user?.name || "সম্মানিত কাস্টমার"}</div>
              <div className="text-[11px] font-mono text-slate-500">{user?.email || user?.phone}</div>
            </div>
            <button
              onClick={handleManualRefresh}
              title="রিফ্রেশ করুন"
              className="p-2 text-slate-600 hover:text-[#5894FF] hover:bg-slate-100 rounded-xl transition-all"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin text-[#5894FF]" : ""} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all"
            >
              <LogOut size={13} />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-gradient-to-r from-[#2D1457] to-[#1a0b33] rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-lime-400 text-slate-950 font-black text-[11px] rounded-full uppercase">
              কাস্টমার ড্যাশবোর্ড
            </span>
            <h1 className="text-2xl font-black mt-2">
              স্বাগতম, {user?.name || "কাস্টমার"}!
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              ইমেইল: <strong className="font-mono text-lime-400">{user?.email || "N/A"}</strong> • আপনার সমস্ত সার্ভিস বুকিং ও লাইভ স্ট্যাটাস
            </p>
          </div>
          <Link
            href="/#booking"
            className="px-4 py-2.5 bg-[#F53E00] hover:bg-[#d93700] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
          >
            <span>নতুন সার্ভিস বুক করুন</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>আমার সার্ভিস বুকিং সমূহ</span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
                {bookings.length}
              </span>
            </h2>
          </div>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wrench size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-700">এখনো কোনো সার্ভিস বুকিং করা হয়নি</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                আপনার বাসা বা অফিসের যে কোনো আইটি সমস্যার জন্য এখনই অনলাইন বুকিং করুন।
              </p>
              <Link
                href="/#booking"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#5894FF] hover:bg-[#437ee8] text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                <span>সার্ভিস বুক করুন</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-[#2D1457]">{b.service_title}</h3>
                      {getStatusBadge(b.status)}
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <span>বুকিং আইডি: <strong className="font-mono text-slate-700">{String(b.id).slice(0, 8)}...</strong></span>
                      {b.created_at && (
                        <span>তারিখ: {new Date(b.created_at).toLocaleDateString("bn-BD")}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-700 flex items-start gap-1.5">
                      <MapPin size={14} className="text-[#F53E00] shrink-0 mt-0.5" />
                      <span>{b.customer_address || b.area || "ঠিকানা সংরক্ষিত"}</span>
                    </div>
                    {b.problem_desc && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        সমস্যা: {b.problem_desc}
                      </p>
                    )}
                    {b.assigned_engineer_name && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                        <div>
                          <strong>দায়িত্বপ্রাপ্ত ইঞ্জিনিয়ার:</strong> {b.assigned_engineer_name}
                          {b.assigned_engineer_phone && (
                            <span className="font-mono ml-2">({b.assigned_engineer_phone})</span>
                          )}
                        </div>
                        {b.assigned_engineer_phone && (
                          <a
                            href={`tel:${b.assigned_engineer_phone}`}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px]"
                          >
                            কল করুন
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {b.status === "Completed" && (
                      <button
                        onClick={() => {
                          setSelectedBookingForReview(b);
                          setRating(b.customer_rating || 5);
                          setReviewComment(b.customer_review || "");
                        }}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                      >
                        <Star size={14} fill="white" />
                        <span>{b.customer_rating ? "রিভিউ পরিবর্তন" : "⭐ রিভিউ দিন"}</span>
                      </button>
                    )}
                    <a
                      href="tel:01991477412"
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1"
                    >
                      <Phone size={13} />
                      <span>সাপোর্ট</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-xl font-black text-[#2D1457]">সার্ভিস রিভিউ ও মতামত</h3>
            <p className="text-xs text-slate-500 mt-1">
              আমাদের ইঞ্জিনিয়ারের কাজের মান কেমন লেগেছে রেটিং দিন:
            </p>
            {reviewSubmitted ? (
              <div className="my-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center font-bold text-sm">
                ধন্যবাদ! আপনার মূল্যবান মতামত সংরক্ষিত হয়েছে।
              </div>
            ) : (
              <div className="my-5 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}
                      />
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">আপনার মূল্যবান মন্তব্য</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="কাজের মান ও ব্যবহার কেমন ছিল লিখুন..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveReview}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow"
                  >
                    রিভিউ সাবমিট করুন
                  </button>
                  <button
                    onClick={() => setSelectedBookingForReview(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
