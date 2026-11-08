import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
const fallbackEngineers = [
  { id: 1, name: 'Engr. Tanvir Ahmed', phone: '01791477412', email: 'tanvir.techsathi@gmail.com', skill: 'Network & Server' },
  { id: 2, name: 'Md. Arif Hossain', phone: '01812345678', email: 'arif.techsathi@gmail.com', skill: 'PC & Windows Repair' },
  { id: 3, name: 'Sajid Karim', phone: '01998877665', email: 'sajid.techsathi@gmail.com', skill: 'CCTV & Wi-Fi' }
];
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('engineers').select('*');
    if (error || !data || data.length === 0) return NextResponse.json(fallbackEngineers);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(fallbackEngineers);
  }
}