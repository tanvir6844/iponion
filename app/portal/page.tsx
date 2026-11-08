"use client";

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
        query = query.or(`customer_phone.eq.${phone},customer_email.eq.${email}`);
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
          _subject: `⭐ নতুন কাস্টমার রিভিউ: ${reviewBooking.service_title} (${rating} Star)`,
          _cc: "tanvirahmedtanvir68441@gmail.com",
          _template: "table",
          "Customer Name": user?.name || reviewBooking.customer_name,
          "Customer Phone": user?.phone || reviewBooking.customer_phone,
          "Service": reviewBooking.service_title,
          "Star Rating": `${rating} / 5 Stars`,
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
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isInProgress
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-sky-100 text-sky-800 border border-sky-300"
                      }`}>
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
                                ফিল্ড ইঞ্জিনিয়ার: <span className="font-semibold">{b.engineer_name}</span> {b.engineer_phone && `(${b.engineer_phone})`}
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
                            <a href={`tel:${b.engineer_phone}`} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
                              <Phone size={12} /> কল
                            </a>
                            <a href={`https://wa.me/880${(b.engineer_phone || "").replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1ebd5b] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
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
                        className={`transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
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
