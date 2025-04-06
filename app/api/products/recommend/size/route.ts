import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { spawn } from 'child_process';
import path from 'path';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// POST /api/products/recommend/size
export async function POST(req: NextRequest) {
  console.log("Size recommendation API called");
  try {
    const body = await req.json();
    const { user_height, user_weight, product_id, measurements, user_id } = body;
    
    console.log(`Size recommendation request: height=${user_height}, weight=${user_weight}, product_id=${product_id}, user_id=${user_id || 'none'}`);
    console.log(`Measurements provided: ${measurements ? Object.keys(measurements).length : 0} fields`);
    
    // Validate input data
    if (!user_height || !user_weight || !product_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_height, user_weight, product_id' },
        { status: 400 }
      );
    }

    // Keep height in cm and weight in kg
    const user_height_cm = user_height;
    const user_weight_kg = user_weight;

    // Get authenticated user if available and no user_id is provided
    let user = null;
    if (!user_id) {
      try {
        const cookieStore = await cookies();
        const supabaseServer = createClient(cookieStore);
        const { data: { user: authUser } } = await supabaseServer.auth.getUser();
        user = authUser;
      } catch (error) {
        console.error('Error getting authenticated user:', error);
        // Continue without user data
      }
    }

    // Get product data from Supabase
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', product_id)
      .single();

    if (productError) {
      console.error('Error fetching product:', productError);
      return NextResponse.json(
        { error: 'Failed to fetch product data' },
        { status: 500 }
      );
    }

    // Debug product data
    console.log(`Product ${product_id} data:`, {
      name: product.name,
      sizes_available: product.sizes,
      has_measurements: !!product.sizes_with_measurements,
      measurements_length: product.sizes_with_measurements ? product.sizes_with_measurements.length : 0,
      sizes_with_measurements_type: product.sizes_with_measurements ? typeof product.sizes_with_measurements : 'undefined'
    });

    // Validate product data
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // If product has no size measurements, return error
    if (!product.sizes_with_measurements) {
      console.log(`Product ${product_id} has no size measurements, returning error`);
      return NextResponse.json(
        { error: 'Product has no size measurements data available' },
        { status: 400 }
      );
    }

    // Parse the size measurements string
    let parsedMeasurements;
    try {
      // The string is in Python dictionary format, so we need to convert it to valid JSON
      const jsonStr = product.sizes_with_measurements
        .replace(/'/g, '"')  // Replace single quotes with double quotes
        .replace(/True/g, 'true')  // Replace Python True with JSON true
        .replace(/False/g, 'false');  // Replace Python False with JSON false
      
      parsedMeasurements = JSON.parse(jsonStr);
      console.log('Successfully parsed size measurements:', parsedMeasurements);
    } catch (e) {
      console.error('Error parsing size measurements:', e);
      return NextResponse.json(
        { error: 'Failed to parse product size measurements' },
        { status: 400 }
      );
    }

    // Process user measurements
    let userMeasurements = measurements || {};
    
    // If measurements are provided as a string, parse them
    if (typeof userMeasurements === 'string') {
      try {
        userMeasurements = JSON.parse(userMeasurements);
      } catch (e) {
        console.error('Error parsing measurements:', e);
        return NextResponse.json(
          { error: 'Invalid measurements format' },
          { status: 400 }
        );
      }
    }

    // No need to convert measurements - they're already in inches

    if (user && Object.keys(userMeasurements).length === 0) {
      // Get measurements from user_profiles for authenticated users
      const cookieStore = cookies();
      const supabaseServer = createClient(cookieStore);
      const { data: userProfile, error: profileError } = await supabaseServer
        .from('user_profiles')
        .select('body_measurements')
        .eq('user_id', user.id)
        .single();
        
      if (!profileError && userProfile && userProfile.body_measurements) {
        userMeasurements = userProfile.body_measurements;
      }
    } else if (user_id && Object.keys(userMeasurements).length === 0) {
      // Get measurements from profiles table for provided user_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('measurements')
        .eq('user_id', user_id)
        .single();
      
      if (!profileError && profileData && profileData.measurements) {
        try {
          const measData = JSON.parse(profileData.measurements);
          if (measData.body_measurements) {
            userMeasurements = measData.body_measurements;
          } else {
            // If no body_measurements, use the measurements directly
            userMeasurements = measData;
          }
        } catch (e) {
          console.error('Error parsing measurements from profiles table:', e);
        }
      }
    }

    // Run the Python script for robust size recommendation
    const pythonPath = 'python3';  // Use python3 command directly
    const scriptPath = path.join(process.cwd(), 'recommender', 'size_recommender.py');

    console.log(`Running size recommender script: ${scriptPath}`);
    console.log(`Python executable: ${pythonPath}`);
    console.log(`User height: ${user_height_cm}cm, User weight: ${user_weight_kg}kg`);
    console.log(`Including detailed measurements: ${JSON.stringify(userMeasurements)}`);
    console.log(`Product data summary: ${JSON.stringify({
      product_id: product.product_id,
      name: product.name,
      sizes: product.sizes,
      has_sizes_with_measurements: !!product.sizes_with_measurements,
    })}`);
    
    const pythonProcess = spawn(pythonPath, [
      scriptPath,
      '--height', user_height_cm.toString(),
      '--weight', user_weight_kg.toString(),
      '--product_data', JSON.stringify(product),
      '--measurements', JSON.stringify(userMeasurements)
    ]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
      console.log(`Python stdout: ${data.toString()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Python error: ${data.toString()}`);
    });

    return new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        console.log(`Python stdout: ${result}`);
        console.log(`Python stderr: ${errorOutput}`);
        
        if (code !== 0) {
          console.error(`Python process failed with code ${code}`);
          console.error(`Error output: ${errorOutput}`);
          return resolve(NextResponse.json(
            { 
              error: `Failed to generate size recommendation: ${errorOutput || 'Unknown error'}`,
              details: 'The size recommender requires product measurement data and user measurements.'
            },
            { status: 500 }
          ));
        }
        
        try {
          if (result && result.trim()) {
            try {
              const recommendation = JSON.parse(result);
              console.log('Successfully parsed recommendation result:', recommendation);
              
              // Check if the recommendation has an error
              if (recommendation.error) {
                return resolve(NextResponse.json(
                  { 
                    error: recommendation.error,
                    details: 'The size recommender requires accurate product and user measurement data.'
                  },
                  { status: 500 }
                ));
              }
              
              return resolve(NextResponse.json(recommendation));
            } catch (e) {
              console.error('Error parsing JSON from Python output:', e);
              console.error('Raw output:', result);
              if (errorOutput) {
                console.error('Error output from Python:', errorOutput);
              }
              return resolve(NextResponse.json(
                { 
                  error: `Invalid output from size recommender: ${e.message}`,
                  details: 'Could not parse the recommender output.'
                },
                { status: 500 }
              ));
            }
          } else {
            console.error('No output from Python script');
            console.error('Error output from Python:', errorOutput);
            return resolve(NextResponse.json(
              { 
                error: 'No output from size recommender',
                details: 'The size recommender did not produce any output.'
              },
              { status: 500 }
            ));
          }
        } catch (e) {
          console.error('Error parsing recommendation result:', e);
          console.error('Python error output:', errorOutput);
          return resolve(NextResponse.json(
            { 
              error: `Failed to get size recommendation: ${e.message}`,
              details: 'An error occurred while processing the recommender output.'
            },
            { status: 500 }
          ));
        }
      });
    });
  } catch (error) {
    console.error('Error in size recommendation API:', error);
    return NextResponse.json(
      { error: 'Failed to process size recommendation' },
      { status: 500 }
    );
  }
}
