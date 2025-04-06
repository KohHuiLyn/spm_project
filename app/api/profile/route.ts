import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/profile?user_id=xxx
// To get the profile (with size/style recommendations) for a specific user
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('user_id');
        
        console.log('Fetching profile for user:', userId);

        // Create Supabase client
        const supabase = await createClient();

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        // Return error if user not found or query fails
        if (error) {
            console.error('Error fetching profile:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Return the user profile data
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error in GET /api/profile:', error);
        return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
    }
}
  
// POST /api/profile
// To insert or update a user's size/style recommendations
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id, styles, measurements, materials } = body;

        console.log('Processing profile with data:', {
            user_id,
            hasStyles: !!styles,
            hasMeasurements: !!measurements,
            hasMaterials: !!materials
        });

        // Validate required fields
        if (!user_id) {
          return NextResponse.json({ error: 'Missing required field: user_id' }, { status: 400 });
        }

        // Create Supabase client
        const supabase = await createClient();

        console.log('Checking if profile exists for user:', user_id);
        
        // Check if profile exists for this user
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user_id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking profile:', checkError);
            return NextResponse.json({ error: checkError.message }, { status: 500 });
        }

        let result;
        if (existingProfile) {
            console.log('Updating existing profile for user:', user_id);
            // Update existing profile
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    styles: styles || existingProfile.styles,
                    measurements: measurements || existingProfile.measurements,
                    materials: materials || existingProfile.materials,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user_id)
                .select();

            if (error) {
                console.error('Error updating profile:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            result = data;
        } else {
            console.log('Creating new profile for user:', user_id);
            // Create new profile
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    user_id,
                    styles,
                    measurements,
                    materials,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) {
                console.error('Error creating profile:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            result = data;
        }

        // Return the updated/inserted profile
        return NextResponse.json({
            success: true,
            message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Error in POST /api/profile:', error);
        return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
    }
}
