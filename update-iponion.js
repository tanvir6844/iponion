const fs = require('fs');
const path = require('path');

// 1. app/portal/page.tsx (Customer Portal with Review Modal & Completed Fix)
const portalPage = `"use client";

import { useState, useEffect } from "react";
import IponionLogo from "@/components/Logo";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, Calendar, Clock, Star, CheckCircle, ArrowLeft, Send, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function CustomerPortal() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [localReviews, setLocalReviews] = useState<{ [id: string]: { rating: number; comment: string } }>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("iponion_user");
      const savedReviews = localStorage.getItem("iponion_customer_reviews");
      if (savedReviews) {
        try { setLocalReviews(JSON.parse(savedReviews)); } catch (e) {}
      }

      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        fetchBookings(parsed.phone, parsed.email);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchBookings = async (phone: string, email: string) => {
    try {
      let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (phone) {
        query = query.or(\`customer_phone.eq.\${phone},customer_email.eq.\${email}\`);
      }
      const { data, error } = await query;
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

  // Submit Review Handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setSubmittingReview(true);

    const reviewData = {
      booking_id: reviewBooking.id,
      service: reviewBooking.service_title,
      customer_name: user?.name || reviewBooking.customer_name,
      customer_phone: user?.phone || reviewBooking.customer_phone,
      rating: rating,
      comment: comment,
      date: new Date().toLocaleDateString('bn-BD')
    };

    // Save in LocalStorage
    const updatedReviews = { ...localReviews, [reviewBooking.id]: { rating, comment } };
    setLocalReviews(updatedReviews);
    localStorage.setItem("iponion_customer_reviews", JSON.stringify(updatedReviews));

    // Try saving in Supabase
    try {
      await supabase.from("bookings").update({
        customer_rating: rating,
        customer_review: comment
      }).eq("id", reviewBooking.id);
    } catch (err) {
      console.log("Supabase review update note:", err);
    }

    // Send email to Admin
    try {
      await fetch("https://formsubmit.co/ajax/iponion.11@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: \`⭐ নতুন কাস্টমার রিভিউ: \${reviewBooking.service_title} (\${rating} Star)\`,
          _cc: "tanvirahmedtanvir68441@gmail.com",
          _template: "table",
          "Customer Name": user?.name || reviewBooking.customer_name,
          "Customer Phone": user?.phone || reviewBooking.customer_phone,
          "Service": reviewBooking.service_title,
          "Star Rating": \`\${rating} / 5 Stars\`,
          "Review / Feedback": comment || "কোনো লিখিত মতামত নেই (শুধু ৫ স্টার)",
          "Submitted At": new Date().toLocaleString()
        })
      });
    } catch (err) {
      console.log("Review email sent", err);
    }

    setSubmittingReview(false);
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setReviewBooking(null);
      setComment("");
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("iponion_user");
    window.location.href = "/auth";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <IponionLogo size="lg" className="justify-center mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">লগইন প্রয়োজন</h2>
          <p className="text-slate-600 mb-6 text-sm">আপনার বুকিং দেখতে দয়া করে লগইন করুন।</p>
          <Link href="/auth" className="block w-full py-3 bg-[#2D1457] hover:bg-[#3d1c75] text-white rounded-xl font-semibold shadow-md">
            লগইন পেজে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><IponionLogo size="md" /></Link>
          <button onClick={handleLogout} className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200">
            লগআউট
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* User Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
            <p className="text-sm text-slate-500 font-mono mt-0.5">{user.phone} • {user.email}</p>
          </div>
          <Link href="/#booking" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2D1457] hover:bg-[#3d1c75] text-white rounded-xl text-sm font-semibold shadow-sm">
            + নতুন সার্ভিস বুক করুন
          </Link>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">আমার বুকিং ও লাইভ সার্ভিস ট্র্যাকিং</h2>
            <button onClick={() => fetchBookings(user.phone, user.email)} className="text-xs text-violet-700 hover:underline font-medium">
              রিফ্রেশ করুন ↻
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>আপনার কোনো বুকিং এখনো রেকর্ড করা হয়নি।</p>
              <Link href="/#booking" className="inline-block mt-3 text-sm text-violet-600 font-semibold hover:underline">
                একটি সার্ভিস বুক করুন →
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {bookings.map((b) => {
                const existingReview = localReviews[b.id] || (b.customer_rating ? { rating: b.customer_rating, comment: b.customer_review } : null);
                const isCompleted = b.status === "Completed" || b.status === "সম্পন্ন";
                const isInProgress = b.status === "In Progress" || b.status === "চলমান";

                return (
                  <div key={b.id} className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <h3 className="font-bold text-slate-900 text-base">{b.service_title}</h3>
                      <span className={\`text-xs font-semibold px-2.5 py-1 rounded-full w-fit \${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isInProgress
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-sky-100 text-sky-800 border border-sky-300"
                      }\`}>
                        {isCompleted ? "✅ Completed" : isInProgress ? "⚙️ In Progress" : "⏳ Pending"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1"><MapPin size={13} className="text-rose-500" /> {b.area || b.customer_address || "Dhaka"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(b.created_at || Date.now()).toLocaleDateString('bn-BD')}</span>
                    </div>

                    {/* STATUS CONDITIONAL BOX */}
                    {isCompleted ? (
                      /* COMPLETED STATE */
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-emerald-900 font-bold text-sm flex items-center gap-1.5">
                              <CheckCircle size={17} className="text-emerald-600" />
                              সার্ভিসটি সফলভাবে সম্পন্ন হয়েছে!
                            </p>
                            {b.engineer_name && (
                              <p className="text-xs text-emerald-800 mt-1">
                                ফিল্ড ইঞ্জিনিয়ার: <span className="font-semibold">{b.engineer_name}</span> {b.engineer_phone && \`(\${b.engineer_phone})\`}
                              </p>
                            )}
                          </div>

                          {/* REVIEW BUTTON OR SHOW REVIEW */}
                          {existingReview ? (
                            <div className="bg-white px-3.5 py-2 rounded-lg border border-emerald-300 flex items-center gap-2">
                              <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} size={14} className={star <= existingReview.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-slate-700">রিভিউ গৃহীত হয়েছে</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReviewBooking(b);
                                setRating(5);
                                setComment("");
                              }}
                              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Star size={14} className="fill-white" />
                              ⭐ রিভিউ ও মতামত দিন
                            </button>
                          )}
                        </div>

                        {existingReview && existingReview.comment && (
                          <p className="text-xs text-emerald-800 bg-white/80 p-2 rounded mt-2 border border-emerald-200 italic">
                            &quot;{existingReview.comment}&quot;
                          </p>
                        )}
                      </div>
                    ) : b.engineer_name ? (
                      /* ENGINEER ASSIGNED (IN PROGRESS / PENDING) */
                      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-violet-800">অ্যাসাইনড ফিল্ড ইঞ্জিনিয়ার</span>
                          <span className="text-[10px] bg-violet-200 text-violet-900 px-2 py-0.5 rounded font-bold">অন-সাইটে নিযুক্ত</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{b.engineer_name}</p>
                            <p className="text-xs text-slate-600 font-mono">{b.engineer_phone}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={\`tel:\${b.engineer_phone}\`} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
                              <Phone size={12} /> কল
                            </a>
                            <a href={\`https://wa.me/880\${(b.engineer_phone || "").replace(/^0/, "")}\`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1ebd5b] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
                              <MessageCircle size={12} /> WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* PENDING ENGINEER ASSIGNMENT */
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-800 text-xs font-medium flex items-center gap-2">
                        <span className="text-base animate-pulse">⏳</span>
                        <span>ইঞ্জিনিয়ার দ্রুত অ্যাসাইন করা হচ্ছে... আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন।</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* REVIEW POPUP MODAL */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 relative">
            <button
              onClick={() => setReviewBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            {reviewSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">ধন্যবাদ!</h3>
                <p className="text-sm text-slate-600 mt-1">আপনার মূল্যবান রিভিউ সফলভাবে জমা হয়েছে।</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="text-center">
                  <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2.5 py-1 rounded-full">সার্ভিস ফিডব্যাক</span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">{reviewBooking.service_title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">আমাদের সার্ভিসটি আপনার কেমন লাগলো?</p>
                </div>

                {/* STAR PICKER */}
                <div className="flex justify-center items-center gap-2 py-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={\`transition-colors \${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }\`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs font-bold text-amber-600">
                  {rating === 5 ? "⭐⭐⭐⭐⭐ অসাধারণ!" : rating === 4 ? "⭐⭐⭐⭐ বেশ ভালো" : rating === 3 ? "⭐⭐⭐ সন্তোষজনক" : "উন্নতির সুযোগ আছে"}
                </p>

                {/* COMMENT TEXTAREA */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    আপনার মূল্যবান মন্তব্য বা কোনো পরামর্শ:
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="ইঞ্জিনিয়ারের ব্যবহার কেমন ছিল? কোনো পরামর্শ থাকলে লিখুন..."
                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:outline-none resize-none"
                  ></textarea>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-[#2D1457] hover:bg-[#3d1c75] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {submittingReview ? (
                    <span>জমা হচ্ছে...</span>
                  ) : (
                    <>
                      <Send size={15} /> রিভিউ জমা দিন
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`;

// 2. app/engineer/page.tsx (Engineer Mobile Portal with 'Mark as Done' Action)
const engineerPage = `"use client";

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

      alert(\`✅ স্ট্যাটাস সফলভাবে '\${newStatus}' আপডেট হয়েছে! কাস্টমার পোর্টালে সাথে সাথে আপডেট দেখতে পাবেন।\`);
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
                  className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-all \${
                    filterMode === "my" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }\`}
                >
                  আমার কাজ
                </button>
                <button
                  onClick={() => setFilterMode("all")}
                  className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-all \${
                    filterMode === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }\`}
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
                        <span className={\`text-xs font-bold px-2.5 py-1 rounded-full \${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }\`}>
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
                          href={\`tel:\${b.customer_phone}\`}
                          className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Phone size={13} className="text-emerald-600" /> কল
                        </a>
                        <a
                          href={\`https://wa.me/880\${cleanPhone}\`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                        <a
                          href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(b.customer_address || b.area || "Dhaka")}\`}
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
`;

// 3. app/admin/page.tsx (Admin dashboard with Reviews display & session persistence)
const adminPage = `"use client";

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
        \`🚨 IPonion নতুন সার্ভিস টাস্ক:\\nকাস্টমার: \${booking.customer_name}\\nফোন: \${booking.customer_phone}\\nসার্ভিস: \${booking.service_title}\\nঠিকানা: \${booking.customer_address || booking.area}\\nবিস্তারিত: \${booking.problem_desc || "N/A"}\`
      );
      window.open(\`https://wa.me/880\${eng.phone.replace(/^0/, "")}?text=\${msg}\`, "_blank");
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
                className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${
                  statusFilter === status
                    ? "bg-[#2D1457] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }\`}
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
                      <span className={\`text-xs font-bold px-2 py-0.5 rounded-full \${
                        b.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                        b.status === "In Progress" ? "bg-amber-100 text-amber-800" :
                        "bg-sky-100 text-sky-800"
                      }\`}>
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
                        <option value="" disabled>{b.engineer_name ? \`বর্তমান: \${b.engineer_name}\` : "ইঞ্জিনিয়ার নির্বাচন করুন"}</option>
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
`;

// Write the files safely
fs.writeFileSync(path.join(__dirname, 'app/portal/page.tsx'), portalPage, 'utf8');
console.log('✓ app/portal/page.tsx updated');

fs.mkdirSync(path.join(__dirname, 'app/engineer'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'app/engineer/page.tsx'), engineerPage, 'utf8');
console.log('✓ app/engineer/page.tsx created');

fs.writeFileSync(path.join(__dirname, 'app/admin/page.tsx'), adminPage, 'utf8');
console.log('✓ app/admin/page.tsx updated');

console.log('\\nAll files written successfully without BOM!');
