"use client";

import { useState, useEffect } from "react";
import IponionLogo from "@/components/Logo";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, Calendar, CheckCircle, Star, Send, X, Plus, LogOut } from "lucide-react";
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
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          fetchUserBookings(parsed.phone, parsed.email);
        } catch (e) {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Fetch strictly for THIS logged in customer phone/email
  const fetchUserBookings = async (phone: string, email: string) => {
    try {
      let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (phone) {
        query = query.or(`customer_phone.eq.${phone},customer_email.eq.${email}`);
      }
      const { data, error } = await query;

      if (data && data.length > 0) {
        // STRICT FILTER: Match only this user and ignore internal registration rows
        const matched = data.filter(b => 
          (b.customer_phone === phone || (email && b.customer_email === email)) &&
          b.service_title !== "Customer Registration" &&
          b.service_title !== "Customer Registration (নতুন গ্রাহক)"
        );
        setBookings(matched);
      } else {
        // LocalStorage fallback strictly matching phone
        const local = localStorage.getItem("iponion_bookings");
        if (local) {
          const allLocal = JSON.parse(local);
          const matchedLocal = allLocal.filter((b: any) => 
            (b.customer_phone === phone || (email && b.customer_email === email)) &&
            b.service_title !== "Customer Registration" &&
            b.service_title !== "Customer Registration (নতুন গ্রাহক)"
          );
          setBookings(matchedLocal);
        } else {
          setBookings([]);
        }
      }
    } catch (err) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setSubmittingReview(true);

    const updatedReviews = { ...localReviews, [reviewBooking.id]: { rating, comment } };
    setLocalReviews(updatedReviews);
    localStorage.setItem("iponion_customer_reviews", JSON.stringify(updatedReviews));

    try {
      await supabase.from("bookings").update({
        customer_rating: rating,
        customer_review: comment
      }).eq("id", reviewBooking.id);
    } catch (err) {}

    setSubmittingReview(false);
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setReviewBooking(null);
      setComment("");
    }, 1800);
  };

  const handleLogout = () => {
    localStorage.removeItem("iponion_user");
    window.location.href = "/auth";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2D1457] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <IponionLogo size="lg" className="justify-center mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">লগইন প্রয়োজন</h2>
          <p className="text-slate-600 mb-6 text-xs">আপনার সার্ভিস বুকিং দেখতে দয়া করে লগইন বা সাইন-আপ করুন।</p>
          <Link href="/auth" className="block w-full py-3.5 bg-[#2D1457] hover:bg-[#3d1c75] text-white rounded-xl font-bold text-sm shadow-md">
            লগইন পেজে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><IponionLogo size="md" /></Link>
          <button onClick={handleLogout} className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1">
            <LogOut size={13} /> লগআউট
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">কাস্টমার অ্যাকাউন্ট</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{user.name}</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user.phone} • {user.email}</p>
            {user.address && <p className="text-xs text-slate-600 mt-1 flex items-center gap-1"><MapPin size={12} className="text-rose-500" /> {user.address}</p>}
          </div>
          <Link href="/#booking" className="inline-flex items-center gap-1.5 px-5 py-3 bg-[#F53E00] hover:bg-[#e03800] text-white rounded-xl text-xs font-black shadow-md transition-all">
            <Plus size={15} /> নতুন সার্ভিস বুক করুন
          </Link>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-black text-slate-900">আমার বুকিং ও লাইভ সার্ভিস ট্র্যাকিং</h2>
            <button onClick={() => fetchUserBookings(user.phone, user.email)} className="text-xs text-violet-700 hover:underline font-bold">
              ↻ রিফ্রেশ
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-violet-50 text-[#2D1457] flex items-center justify-center mx-auto mb-3 font-bold">
                ✓
              </div>
              <p className="font-bold text-slate-800 text-sm">আপনার কোনো সার্ভিস বুকিং এখনো রেকর্ড করা হয়নি।</p>
              <p className="text-xs text-slate-500 mt-1">বাসা বা অফিসের যেকোনো আইটি সমস্যার জন্য নিচে ক্লিক করে বুকিং দিন:</p>
              <Link href="/#booking" className="inline-block mt-4 px-5 py-2.5 bg-[#2D1457] hover:bg-[#3d1c75] text-white rounded-xl text-xs font-bold shadow transition-all">
                + এখনই সার্ভিস বুক করুন
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => {
                const existingReview = localReviews[b.id] || (b.customer_rating ? { rating: b.customer_rating, comment: b.customer_review } : null);
                const isCompleted = b.status === "Completed" || b.status === "সম্পন্ন";
                const isInProgress = b.status === "In Progress" || b.status === "চলমান";

                return (
                  <div key={b.id} className="border border-slate-200 rounded-2xl p-5 hover:border-violet-300 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <h3 className="font-black text-slate-900 text-base">{b.service_title}</h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${
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

                    {isCompleted ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-emerald-900 font-bold text-sm flex items-center gap-1.5">
                              <CheckCircle size={17} className="text-emerald-600" />
                              সার্ভিসটি সফলভাবে সম্পন্ন হয়েছে!
                            </p>
                            {b.engineer_name && (
                              <p className="text-xs text-emerald-800 mt-1">
                                ফিল্ড ইঞ্জিনিয়ার: <span className="font-bold">{b.engineer_name}</span> {b.engineer_phone && `(${b.engineer_phone})`}
                              </p>
                            )}
                          </div>

                          {existingReview ? (
                            <div className="bg-white px-3.5 py-2 rounded-lg border border-emerald-300 flex items-center gap-2">
                              <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} size={14} className={s <= existingReview.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-slate-700">রিভিউ সম্পন্ন</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setReviewBooking(b); setRating(5); setComment(""); }}
                              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5"
                            >
                              <Star size={14} className="fill-white" /> ⭐ রিভিউ ও মতামত দিন
                            </button>
                          )}
                        </div>
                      </div>
                    ) : b.engineer_name ? (
                      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-violet-800">অ্যাসাইনড ফিল্ড ইঞ্জিনিয়ার: {b.engineer_name}</span>
                          <span className="text-[10px] bg-violet-200 text-violet-900 px-2 py-0.5 rounded font-bold">অন-সাইটে নিযুক্ত</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <a href={`tel:${b.engineer_phone}`} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                            <Phone size={12} /> কল
                          </a>
                          <a href={`https://wa.me/880${(b.engineer_phone || "").replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-bold flex items-center gap-1">
                            <MessageCircle size={12} /> WhatsApp
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-800 text-xs font-semibold flex items-center gap-2">
                        <span>⏳ ইঞ্জিনিয়ার দ্রুত অ্যাসাইন করা হচ্ছে... আমাদের প্রতিনিধি খুব শীঘ্রই যোগাযোগ করবেন।</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* REVIEW MODAL */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-slate-200 relative">
            <button onClick={() => setReviewBooking(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>

            {reviewSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">ধন্যবাদ!</h3>
                <p className="text-xs text-slate-600 mt-1">আপনার মূল্যবান রিভিউ সফলভাবে জমা হয়েছে।</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-900">{reviewBooking.service_title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">আমাদের সার্ভিসটি আপনার কেমন লাগলো?</p>
                </div>

                <div className="flex justify-center items-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star size={32} className={star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">আপনার মূল্যবান মন্তব্য বা পরামর্শ:</label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="ইঞ্জিনিয়ারের ব্যবহার বা কাজের মান কেমন ছিল লিখুন..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-[#2D1457] hover:bg-[#3d1c75] text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2"
                >
                  <Send size={15} /> রিভিউ জমা দিন
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
