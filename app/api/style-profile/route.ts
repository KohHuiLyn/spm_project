import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// POST /api/style-profile
// Save user style preferences and body measurements
export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Parse the request body
    const body = await request.json();
    const { user_id, stylePreferences, material_preferences, measurements } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!stylePreferences || !Array.isArray(stylePreferences)) {
      return NextResponse.json(
        { error: 'Style preferences are required and must be an array' },
        { status: 400 }
      );
    }

    if (!measurements) {
      return NextResponse.json(
        { error: 'Measurements are required' },
        { status: 400 }
      );
    }

    // Parse measurements if it's a string
    let parsedMeasurements;
    try {
      parsedMeasurements = typeof measurements === 'string' ? JSON.parse(measurements) : measurements;
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid measurements format' },
        { status: 400 }
      );
    }

    // Check if user already has a profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', fetchError);
      return NextResponse.json(
        { error: 'Error checking existing profile' },
        { status: 500 }
      );
    }

    // Prepare the data for upsert
    const profileData = {
      user_id,
      styles: JSON.stringify(stylePreferences),
      materials: JSON.stringify(material_preferences || []),
      measurements: JSON.stringify(parsedMeasurements),
      updated_at: new Date().toISOString()
    };

    if (!existingProfile) {
      profileData['created_at'] = new Date().toISOString();
    }

    // Insert or update the profile
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Error saving profile:', upsertError);
      return NextResponse.json(
        { error: 'Error saving profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing style profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/style-profile
// Get user style preferences and body measurements
export async function GET(req: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Get user ID from query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's style profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching style profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch style profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('Error in GET /api/style-profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
