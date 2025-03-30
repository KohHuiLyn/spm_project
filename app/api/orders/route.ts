import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// POST /api/orders
// This is to insert a new order into the orders table
export async function POST(req: Request) {
    const body = await req.json()
    const { user_id, product_id, size, quantity, total_price } = body
  
    const { data, error } = await supabase.from('orders').insert({
      user_id,
      product_id,
      size,
      quantity,
      total_price,
    })

    // Return error if insertion fails
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Return the inserted order data
    return NextResponse.json(data)
}
