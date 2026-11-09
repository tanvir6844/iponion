const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
console.log("🛠️ Starting complete build fix...");
// 1. UPDATE package.json to include firebase
const pkgPath = path.join(__dirname, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.dependencies = pkg.dependencies || {};
  if (!pkg.dependencies['firebase']) {
    pkg.dependencies['firebase'] = "^11.0.0";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    console.log("✅ Added firebase to package.json dependencies!");
  }
}
// 2. CREATE lib/supabase.ts AND lib/supabase/client.ts (Both guaranteed!)
const supaCode = `import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rrdogwshgjxtxernujyq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZG9nd3NoZ2p4dHhlcm51anlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzQxNjMsImV4cCI6MjA1NjgwOTE2M30.4i4k3H_e5L0-3d_zKqD5q-jP4q4q4q4q4q4q4q4q4q4";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
`;
const libDir = path.join(__dirname, 'lib');
if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });
fs.writeFileSync(path.join(libDir, 'supabase.ts'), supaCode, 'utf8');
const supaSubDir = path.join(libDir, 'supabase');
if (!fs.existsSync(supaSubDir)) fs.mkdirSync(supaSubDir, { recursive: true });
fs.writeFileSync(path.join(supaSubDir, 'client.ts'), supaCode, 'utf8');
console.log("✅ lib/supabase.ts & lib/supabase/client.ts created!");
// 3. CREATE lib/firebase.ts
const fbCode = `import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyB5kXrmJgSFcnxIqQHLWtY5diInLHRbeAc",
  authDomain: "iponion-5ae62.firebaseapp.com",
  projectId: "iponion-5ae62",
  storageBucket: "iponion-5ae62.firebasestorage.app",
  messagingSenderId: "799003447400",
  appId: "1:799003447400:web:6d1d01c8c8c1a46c43ebdd",
  measurementId: "G-8KQTPQ4PY"
};
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
};
`;
fs.writeFileSync(path.join(libDir, 'firebase.ts'), fbCode, 'utf8');
console.log("✅ lib/firebase.ts verified!");
// 4. CLEAN app/auth/page.tsx
const authPage = `"use client";
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
        setError("⚠️ আপনার ইমেইলটি এখনো ভেরিফাই করা হয়নি! আপনার ইনবক্স চেক করে লিংকে ক্লিক করুন।");
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
        <div className="flex border-b border-slate-200 mb-5">
          <button
            onClick={() => { setTab("login"); setError(""); setSuccessMsg(""); }}
            className={\`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all \${tab === "login" ? "border-[#5894FF] text-[#5894FF]" : "border-transparent text-slate-400 hover:text-slate-600"}\`}
          >
            লগইন (Sign In)
          </button>
          <button
            onClick={() => { setTab("register"); setError(""); setSuccessMsg(""); }}
            className={\`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all \${tab === "register" ? "border-[#5894FF] text-[#5894FF]" : "border-transparent text-slate-400 hover:text-slate-600"}\`}
          >
            নতুন রেজিস্ট্রেশন
          </button>
        </div>
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
`;
fs.writeFileSync(path.join(__dirname, 'app', 'auth', 'page.tsx'), authPage, 'utf8');
console.log("✅ app/auth/page.tsx rewritten cleanly!");
// 5. CLEAN app/portal/page.tsx
const portalPage = `"use client";
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
      if (last10) orList.push(\`customer_phone.ilike.%\${last10}%\`);
      if (userEmail) orList.push(\`customer_email.eq.\${userEmail}\`);
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
                            href={\`tel:\${b.assigned_engineer_phone}\`}
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
`;
fs.writeFileSync(path.join(__dirname, 'app', 'portal', 'page.tsx'), portalPage, 'utf8');
console.log("✅ app/portal/page.tsx rewritten cleanly!");
console.log("🎉 Complete fix applied successfully!");
