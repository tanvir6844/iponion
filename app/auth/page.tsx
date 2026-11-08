'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import IponionLogo from '@/components/Logo';
import Link from 'next/link';
export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone } }
        });
        if (error) throw error;
        setMessage('অ্যাকাউন্ট তৈরি হয়েছে! অনুগ্রহ করে লগইন করুন।');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/portal');
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#1C0D36] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <IponionLogo size={48} />
        </div>
        <h2 className="text-2xl font-black text-[#2D1457] text-center mb-1">
          {isSignUp ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'কাস্টমার পোর্টালে সাইন ইন'}
        </h2>
        <p className="text-slate-500 text-xs text-center mb-6">IPonion 24/7 IT Support Tracking</p>
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-slate-100 text-xs font-semibold text-slate-800 text-center">
            {message}
          </div>
        )}
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">আপনার পূর্ণ নাম *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#2D1457]"
                placeholder="যেমন: মো: আরিফুল ইসলাম"
              />
            </div>
          )}
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#2D1457]"
                placeholder="017XXXXXXXX"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল অ্যাড্রেস *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#2D1457]"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#2D1457]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#2D1457] text-white font-bold text-sm hover:bg-[#3D1A75] transition shadow-md shadow-violet-950/20 disabled:opacity-50"
          >
            {loading ? 'প্রক্রিয়াধীন...' : isSignUp ? 'সাইন আপ করুন' : 'লগইন করুন'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-[#FF6B57] hover:underline"
          >
            {isSignUp ? 'পূর্বে অ্যাকাউন্ট থাকলে? লগইন করুন' : 'নতুন অ্যাকাউন্ট খুলতে চান? সাইন আপ করুন'}
          </button>
        </div>
        <div className="mt-4 text-center border-t border-slate-100 pt-3">
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-slate-600">
            ← মূল ওয়েবসাইটে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}