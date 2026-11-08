'use client';
import { useState, useEffect } from 'react';
import IponionLogo from '@/components/Logo';
import { Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [bookings, setBookings] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  useEffect(() => {
    if (authed) loadData();
  }, [authed, statusFilter]);
  const loadData = async () => {
    try {
      const bRes = await fetch('/api/bookings?status=' + statusFilter + '&search=' + encodeURIComponent(search));
      const eRes = await fetch('/api/engineers');
      const bData = await bRes.json();
      const eData = await eRes.json();
      setBookings(Array.isArray(bData) ? bData : []);
      setEngineers(Array.isArray(eData) ? eData : []);
    } catch (err) {}
  };
  const handleAssign = async (bookingId, engineerId) => {
    await fetch('/api/bookings/' + bookingId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigned_engineer_id: engineerId })
    });
    loadData();
  };
  const handleStatus = async (bookingId, status) => {
    await fetch('/api/bookings/' + bookingId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadData();
  };
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#1C0D36] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="flex justify-center mb-4"><IponionLogo size={42} /></div>
          <h2 className="text-xl font-black text-[#2D1457] mb-1">Super Admin Panel</h2>
          <p className="text-xs text-slate-500 mb-6">Default password: admin123</p>
          <input
            type="password"
            placeholder="Admin Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm mb-4 outline-none focus:border-[#2D1457]"
          />
          <button
            onClick={() => {
              if (pass === 'admin123') setAuthed(true);
              else alert('ভুল পাসওয়ার্ড! ডিফল্ট: admin123');
            }}
            className="w-full py-3 rounded-xl bg-[#2D1457] text-white font-bold text-sm hover:bg-[#3D1A75]"
          >
            লগইন করুন
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-4">
            <IponionLogo size={36} />
            <span className="text-sm font-bold text-slate-400">| Control Center</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-bold text-[#2D1457] hover:underline">Website ↗</Link>
            <button onClick={() => setAuthed(false)} className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold">Logout</button>
          </div>
        </header>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="🔍 Search name, phone, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm w-full sm:w-72 outline-none"
            />
            <button onClick={loadData} className="px-4 py-2 bg-[#2D1457] text-white text-xs font-bold rounded-xl">Search</button>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
          >
            <option value="all">All Status</option>
            <option value="Pending">⏳ Pending</option>
            <option value="In Progress">⚙️ In Progress</option>
            <option value="Completed">✅ Completed</option>
          </select>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Service & Area</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assign Engineer</th>
                  <th className="p-4">Dispatch Task</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => {
                  const dispatchMsg = encodeURIComponent(
                    '[IPonion Task]\nService: ' + b.service_title + '\nCustomer: ' + b.customer_name + '\nPhone: ' + b.phone + '\nLocation: ' + b.area
                  );
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold">
                        {b.customer_name}<br />
                        <a href={'tel:' + b.phone} className="text-[#2D1457] text-xs">📞 {b.phone}</a>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800">{b.service_title}</span><br />
                        <span className="text-xs text-slate-500">📍 {b.area}</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatus(b.id, e.target.value)}
                          className="px-2 py-1 rounded-lg text-xs font-bold border border-slate-300 bg-white"
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="In Progress">⚙️ In Progress</option>
                          <option value="Completed">✅ Completed</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <select
                          value={b.assigned_engineer_id || ''}
                          onChange={(e) => handleAssign(b.id, Number(e.target.value))}
                          className="px-2 py-1.5 rounded-lg text-xs border border-violet-200 bg-violet-50 font-semibold"
                        >
                          <option value="">-- Select Engineer --</option>
                          {engineers.map((eng) => (
                            <option key={eng.id} value={eng.id}>👨‍🔧 {eng.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        {b.engineers ? (
                          <div className="flex gap-2">
                            <a
                              href={'mailto:' + b.engineers.email + '?subject=Task Assigned&body=' + dispatchMsg}
                              className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                              title="Email Engineer"
                            >
                              <Mail size={15} />
                            </a>
                            <a
                              href={'https://wa.me/88' + b.engineers.phone + '?text=' + dispatchMsg}
                              target="_blank"
                              className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              title="WhatsApp Task"
                            >
                              <MessageCircle size={15} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}