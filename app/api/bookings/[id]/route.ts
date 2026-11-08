import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const updateData = {};
    if (body.status) updateData.status = body.status;
    if (body.assigned_engineer_id !== undefined) {
      updateData.assigned_engineer_id = body.assigned_engineer_id || null;
      if (body.assigned_engineer_id) updateData.status = 'In Progress';
    }
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', params.id)
      .select('*, engineers(*)')
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}