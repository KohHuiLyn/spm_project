import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/products/[id]
// To fetch a single product by its product_id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('product_id', id)
    .single() // ensures we only get one

  if (error) {
    console.error('Supabase Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
