import { supabase } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/products
// To fetch all products from the products table
export async function GET() {
  const { data, error } = await supabase.from('products').select('*')
  console.log('Data:', data)

  // Log and return error if fetching fails
  if (error) {
    console.error('Supabase Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return product data
  return NextResponse.json(data)
}
