"use client";

import { useState } from "react";
import IponionLogo from "@/components/Logo";
import Link from "next/link";
import { User, Wrench, Shield, ArrowRight, Phone, Lock, MapPin, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("register");

  // Registration Form State
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Login Form State
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // REGISTER HANDLER
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!regName.trim() || !regPhone.trim() || !regPassword) {
      setErrorMsg("দয়া করে নাম, মোবাইল নম্বর এবং পাসওয়ার্ড পূরণ করুন।");
      return;
    }

    if (regPhone.trim().length < 11) {
      setErrorMsg("দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)");
      return;
    }

    if (regPassword.length < 4) {
      setErrorMsg("পাসওয়ার্ড কমপক্ষে ৪ ডিজিটের হতে হবে।");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg("দুইটি পাসওয়ার্ড মিলছে না! পুনরায় চেক করুন।");
      return;
    }

    setLoading(true);

    const newUser = {
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim() || `${regPhone.trim()}@customer.iponion.com`,
      address: regAddress.trim() || "Dhaka",
      password: regPassword,
      registered_at: new Date().toISOString()
    };

    try {
      // 1. Save in registered users list
      let usersList: any[] = [];
      const savedUsers = localStorage.getItem("iponion_registered_customers");
      if (savedUsers) {
        try { usersList = JSON.parse(savedUsers); } catch (e) {}
      }

      // Check if already registered
      const existing = usersList.find((u: any) => u.phone === newUser.phone);
      if (existing) {
        setErrorMsg("এই মোবাইল নম্বরে ইতোমধ্যে অ্যাকাউন্ট খোলা আছে! লগইন করার চেষ্টা করুন।");
        setLoading(false);
        return;
      }

      usersList.push(newUser);
      localStorage.setItem("iponion_registered_customers", JSON.stringify(usersList));

      // 2. Set current active logged in session
      localStorage.setItem("iponion_user", JSON.stringify(newUser));

      // 3. Try syncing to Supabase customers table if available
      try {
        await supabase.from("customers").insert([
          { name: newUser.name, phone: newUser.phone, email: newUser.email, address: newUser.address }
        ]);
      } catch (err) {}

      setSuccessMsg("🎉 অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। পোর্টালে নিয়ে যাওয়া হচ্ছে...");
      setTimeout(() => {
        window.location.href = "/portal";
      }, 1000);

    } catch (err) {
      setErrorMsg("অ্যাকাউন্ট খুলতে সমস্যা হয়েছে, আবার চেষ্টা করুন।");
      setLoading(false);
    }
  };

  // LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!loginPhone.trim()) {
      setErrorMsg("মোবাইল নম্বর দিন।");
      return;
    }

    setLoading(true);

    try {
      // Check in registered users list
      let usersList: any[] = [];
      const savedUsers = localStorage.getItem("iponion_registered_customers");
      if (savedUsers) {
        try { usersList = JSON.parse(savedUsers); } catch (e) {}
      }

      const foundUser = usersList.find((u: any) => u.phone === loginPhone.trim());

      if (foundUser) {
        if (loginPassword && foundUser.password !== loginPassword) {
          setErrorMsg("পাসওয়ার্ড সঠিক নয়! দয়া করে সঠিক পাসওয়ার্ড দিন।");
          setLoading(false);
          return;
        }

        localStorage.setItem("iponion_user", JSON.stringify(foundUser));
        setSuccessMsg("লগইন সফল হয়েছে! পোর্টালে নিয়ে যাওয়া হচ্ছে...");
        setTimeout(() => {
          window.location.href = "/portal";
        }, 800);
        return;
      }

      // If not in local registered list, allow direct entry with phone (auto session)
      const guestUser = {
        name: "সম্মানিত গ্রাহক",
        phone: loginPhone.trim(),
        email: `${loginPhone.trim()}@customer.iponion.com`,
        address: "Dhaka"
      };
      localStorage.setItem("iponion_user", JSON.stringify(guestUser));
      setSuccessMsg("লগইন সফল হয়েছে!");
      setTimeout(() => {
        window.location.href = "/portal";
      }, 800);

    } catch (err) {
      setErrorMsg("লগইন করতে সমস্যা হয়েছে।");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-block"><IponionLogo size="lg" /></Link>
        <h2 className="mt-3 text-2xl font-black text-slate-900">কাস্টমার লগইন ও রেজিস্ট্রেশন</h2>
        <p className="text-xs text-slate-500 mt-1">আপনার সার্ভিস বুকিং ও লাইভ আপডেট ট্র্যাক করুন</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Main Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              onClick={() => { setTab("register"); setErrorMsg(""); setSuccessMsg(""); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                tab === "register" ? "bg-[#2D1457] text-white shadow-md" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              নতুন অ্যাকাউন্ট (Sign Up)
            </button>
            <button
              onClick={() => { setTab("login"); setErrorMsg(""); setSuccessMsg(""); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                tab === "login" ? "bg-[#2D1457] text-white shadow-md" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              লগইন (Sign In)
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl mb-4 font-semibold flex items-center gap-2">
              <CheckCircle size={15} className="flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* REGISTRATION FORM */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  required
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর (১১ ডিজিট) *</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="01991477412"
                  required
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বাসা / অফিসের ঠিকানা বা এলাকা</label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="যেমন: বাড়ি ২৭, বসিলা গার্ডেন সিটি, ঢাকা"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড *</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড দিন"
                    required
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">নিশ্চিত করুন *</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="পুনরায় পাসওয়ার্ড"
                    required
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#2D1457] to-[#451f85] hover:opacity-95 text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন (Sign Up)"}
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* LOGIN FORM */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  required
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড (যদি দেওয়া থাকে)</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#2D1457] hover:bg-[#3d1c75] text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? "লগইন হচ্ছে..." : "লগইন করুন (Sign In)"}
                <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>

        {/* Dedicated Admin and Engineer Links */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">অন্যান্য পোর্টালসমূহ</p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/engineer"
              className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-lime-500 shadow-sm transition-all flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-800 flex items-center justify-center flex-shrink-0">
                <Wrench size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 group-hover:text-lime-700 truncate">ইঞ্জিনিয়ার লগইন</p>
                <p className="text-[10px] text-slate-500">অন-সাইট টাস্ক</p>
              </div>
            </Link>

            <Link
              href="/admin"
              className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-violet-600 shadow-sm transition-all flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                <Shield size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 group-hover:text-violet-700 truncate">অ্যাডমিন প্যানেল</p>
                <p className="text-[10px] text-slate-500">ম্যানেজমেন্ট</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
