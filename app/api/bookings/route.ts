import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer_name, phone, service_title, area, problem_desc } = body;

    const { data, error } = await supabaseAdmin.from("bookings").insert([
      { customer_name, phone, service_title, area, problem_desc }
    ]).select().single();

    const waText = `*New 24/7 Service Booking (IPonion)*%0A👤 *Name:* ${encodeURIComponent(customer_name)}%0A📞 *Phone:* ${encodeURIComponent(phone)}%0A🛠️ *Service:* ${encodeURIComponent(service_title)}%0A📍 *Location:* ${encodeURIComponent(area)}`;
    const whatsappUrl = `https://wa.me/8801791477412?text=${waText}`;

    return NextResponse.json({ success: true, booking: data, whatsappUrl });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
