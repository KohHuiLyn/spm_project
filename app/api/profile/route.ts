import { supabase } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/profile?user_id=xxx
// To get the profile (with size/style recommendations) for a specific user
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Return error if user not found or query fails
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Return the user profile data
    return NextResponse.json(data)
}
  
// POST /api/profile
// To insert or update a user's size/style recommendations
export async function POST(req: Request) {
    const body = await req.json()
    const { user_id, size_recos, style_recos } = body

    const { data, error } = await supabase.from('profiles').upsert({
      user_id,
      size_recos,
      style_recos,
    })

    // Return error if upsert fails
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Return the updated/inserted profile
    return NextResponse.json(data)
}
