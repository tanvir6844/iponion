"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, 
  KeyRound, Send, Phone
} from "lucide-react";
import IponionLogo from "@/components/Logo";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from "@/lib/firebase";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        localStorage.setItem("iponion_user", JSON.stringify({
          name: user.displayName || name || "Customer",
          email: user.email,
          phone: phone || user.phoneNumber || "",
          photoURL: user.photoURL || "",
          role: "customer"
        }));
        router.replace("/portal");
      }
    });
    return () => unsubscribe();
  }, [router, name, phone]);

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userData = {
        name: user.displayName || "Google User",
        email: user.email,
        phone: user.phoneNumber || "",
        photoURL: user.photoURL || "",
        role: "customer"
      };
      localStorage.setItem("iponion_user", JSON.stringify(userData));
      router.replace("/portal");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("গুগল সাইন-ইন উইন্ডো বন্ধ করা হয়েছে। আবার চেষ্টা করুন।");
      } else {
        setError("গুগল লগইনে সমস্যা: " + err.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("সবগুলো ফিল্ড পূরণ করুন।");
      return;
    }
    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(userCredential.user);

      localStorage.setItem("iponion_user", JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: "customer"
      }));

      setSuccessMsg("🎉 রেজিস্ট্রেশন সফল হয়েছে! আপনার ইমেইল (" + email + ")-এ একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। দয়া করে মেইল চেক করে লিংকে ক্লিক করুন।");
      setTab("login");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা আছে। লগইন করুন।");
      } else if (err.code === "auth/invalid-email") {
        setError("সঠিক ইমেইল অ্যাড্রেস লিখুন।");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("⚠️ আপনার ইমেইলটি এখনো ভেরিফাই করা হয়নি! অনুগ্রহ করে আপনার ইনবক্স চেক করে লিংকে ক্লিক করুন।");
        setLoading(false);
        return;
      }

      const userData = {
        name: user.displayName || name || "Customer",
        email: user.email,
        phone: phone || user.phoneNumber || "",
        role: "customer"
      };
      localStorage.setItem("iponion_user", JSON.stringify(userData));
      router.replace("/portal");
    } catch (err: any) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("ভুল ইমেইল অথবা পাসওয়ার্ড দিয়েছেন।");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setSuccessMsg("পুনরায় ভেরিফিকেশন মেইল পাঠানো হয়েছে।");
      } catch (err: any) {
        setError("লিংক পাঠাতে সমস্যা: " + err.message);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("আপনার রেজিস্টার্ড ইমেইলটি লিখুন।");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg("পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b33] via-[#2D1457] to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-3">
            <IponionLogo size="md" />
          </Link>
          <h2 className="text-2xl font-black text-[#2D1457]">
            {tab === "login" && "কাস্টমার পোর্টাল লগইন"}
            {tab === "register" && "নতুন কাস্টমার রেজিস্ট্রেশন"}
            {tab === "forgot" && "পাসওয়ার্ড রিসেট"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            গুগল ও ফায়ারবেস সিকিউর অথেনটিকেশন
          </p>
        </div>

        {/* GOOGLE SIGN IN BUTTON */}
        {tab !== "forgot" && (
          <div className="mb-5">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 px-4 border border-slate-300 rounded-xl flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{googleLoading ? "কানেক্ট হচ্ছে..." : "Google দিয়ে ১-ক্লিকে সাইন ইন"}</span>
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-3 text-xs text-slate-400 font-semibold">অথবা ইমেইল ব্যবহার করুন</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>
          </div>
        )}

        {/* ALERTS */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              {error}
              {error.includes("ভেরিফাই") && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="block mt-1 text-[#5894FF] underline font-bold"
                >
                  পুনরায় ভেরিফিকেশন মেইল পাঠান
                </button>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TABS */}
        <div className="flex border-b border-slate-200 mb-5">
          <button
            onClick={() => { setTab("login"); setError(""); setSuccessMsg(""); }}
            className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all ${tab === "login" ? "border-[#5894FF] text-[#5894FF]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            লগইন (Sign In)
          </button>
          <button
            onClick={() => { setTab("register"); setError(""); setSuccessMsg(""); }}
            className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all ${tab === "register" ? "border-[#5894FF] text-[#5894FF]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            নতুন রেজিস্ট্রেশন
          </button>
        </div>

        {/* LOGIN FORM */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল অ্যাড্রেস *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">পাসওয়ার্ড *</label>
                <button
                  type="button"
                  onClick={() => setTab("forgot")}
                  className="text-[11px] text-[#5894FF] hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#5894FF] hover:bg-[#437ee8] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? "ভেরিফাই হচ্ছে..." : "লগইন করুন"}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">আপনার নাম *</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল অ্যাড্রেস *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ফোন নম্বর (যোগাযোগের জন্য)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Send size={16} />
              <span>{loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "রেজিস্ট্রেশন করুন ও মেইল ভেরিফাই করুন"}</span>
            </button>
          </form>
        )}

        {/* FORGOT FORM */}
        {tab === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">আপনার রেজিস্টার্ড ইমেইল</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5894FF] text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#5894FF] hover:bg-[#437ee8] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? "পাঠানো হচ্ছে..." : "পাসওয়ার্ড রিসেট লিংক পাঠান"}</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("login")}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
            >
              লগইন পেইজে ফিরে যান
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link href="/" className="text-xs text-[#5894FF] hover:underline font-semibold">
            ← হোমপেইজে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
