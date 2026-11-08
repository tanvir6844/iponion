import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const phone = searchParams.get('phone');

    let query = supabaseAdmin
      .from('bookings')
      .select('*, engineers(*)')
      .order('created_at', { ascending: false });

    if (phone) query = query.ilike('phone', '%' + phone + '%');
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    let results = data || [];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter((b) =>
        (b.customer_name && b.customer_name.toLowerCase().includes(q)) ||
        (b.phone && b.phone.includes(q)) ||
        (b.area && b.area.toLowerCase().includes(q)) ||
        (b.service_title && b.service_title.toLowerCase().includes(q)) ||
        (b.engineers && b.engineers.name && b.engineers.name.toLowerCase().includes(q))
      );
    }

    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { customer_name, phone, service_title, area, problem_desc } = body;

    if (!customer_name || !phone || !service_title || !area) {
      return NextResponse.json({ error: 'সকল প্রয়োজনীয় তথ্য পূরণ করুন' }, { status: 400 });
    }

    // ১. Supabase ডাটাবেসে বুকিং সেভ
    const { data, error } = await supabaseAdmin.from('bookings').insert([
      { customer_name, phone, service_title, area, problem_desc: problem_desc || 'No description' }
    ]).select().single();

    if (error) throw error;

    // ২. সরাসরি iponion.11@gmail.com এ নোটিফিকেশন পাঠানো (Zero Setup Instant Mail Delivery)
    const adminEmail = 'iponion.11@gmail.com';

    try {
      await fetch('https://formsubmit.co/ajax/' + adminEmail, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: '🚨 New Booking Alert: ' + service_title + ' (' + customer_name + ')',
          'Customer Name': customer_name,
          'Customer Phone': phone,
          'Service Needed': service_title,
          'Service Area (Dhaka)': area,
          'Problem Description': problem_desc || 'N/A',
          'Admin Panel Link': 'https://iponion-two.vercel.app/admin'
        })
      });
    } catch (mailErr) {
      console.error('Mail Delivery Error:', mailErr);
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}