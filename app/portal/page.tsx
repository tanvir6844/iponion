'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import IponionLogo from '@/components/Logo';
import { Phone, MessageCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
export default function PortalPage() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data || !data.user) {
        router.push('/auth');
      } else {
        setUser(data.user);
        loadBookings(data.user);
      }
    });
  }, []);
  const loadBookings = async (currentUser) => {
    const phone = (currentUser.user_metadata && currentUser.user_metadata.phone) || '';
    try {
      const res = await fetch('/api/bookings?phone=' + phone);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {}
    setLoading(false);
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Link href="/"><IponionLogo size={38} /></Link>
          <button onClick={handleLogout} className="px-3.5 py-1.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition inline-flex items-center gap-1.5">
            <LogOut size={14} /> Logout
          </button>
        </header>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-wrap items-center justify-between gap-4 mb-6 shadow-sm">
          <div>
            <h1 className="text-xl font-black text-[#2D1457]">
              {(user && user.user_metadata && user.user_metadata.full_name) || 'Customer Profile'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{user && user.email} • {user && user.user_metadata && user.user_metadata.phone}</p>
          </div>
          <Link href="/#booking" className="px-4 py-2 bg-[#2D1457] text-white rounded-xl text-xs font-bold hover:bg-[#3D1A75] transition">
            + নতুন সার্ভিস বুক করুন
          </Link>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-black text-[#2D1457] mb-5">আমার বুকিং ও লাইভ সার্ভিস ট্র্যাকিং</h2>
          {loading ? (
            <p className="text-sm text-slate-500">লোড হচ্ছে...</p>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">কোনো পূর্ববর্তী বুকিং রেকর্ড পাওয়া যায়নি।</div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-extrabold text-slate-900 text-base">{b.service_title}</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">📍 {b.area} • 📅 {new Date(b.created_at).toLocaleDateString()}</p>
                  {b.engineers ? (
                    <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase text-[#FF6B57]">নির্ধারিত টেকনিশিয়ান:</div>
                        <div className="text-sm font-extrabold text-[#2D1457]">{b.engineers.name}</div>
                        <div className="text-xs text-slate-600">{b.engineers.skill}</div>
                      </div>
                      <div className="flex gap-2">
                        <a href={'tel:' + b.engineers.phone} className="px-3 py-1.5 rounded-lg bg-[#2D1457] text-white text-xs font-bold inline-flex items-center gap-1">
                          <Phone size={13} /> কল দিন
                        </a>
                        <a href={'https://wa.me/88' + b.engineers.phone} target="_blank" className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold inline-flex items-center gap-1">
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      ⏳ ইঞ্জিনিয়ার দ্রুত অ্যাসাইন করা হচ্ছে...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}