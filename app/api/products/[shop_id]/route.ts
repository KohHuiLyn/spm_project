import { supabase } from '../../../../lib/supabase'
import { NextResponse } from 'next/server'

// Should do fetching by params or by JSON
export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    // Fetch product by ID
  }
  