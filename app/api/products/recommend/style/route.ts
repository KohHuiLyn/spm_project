import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');
    const limit = searchParams.get('limit') || '10';
    const product_id = searchParams.get('product_id');
    
    // First check if user has a model
    let hasModel = user_id ? checkUserModelExists(user_id) : false;
    console.log(`User ${user_id} ${hasModel ? 'has' : 'does not have'} a personalized model`);
    
    // If no model exists, try to create one using style preferences
    if (!hasModel && user_id) {
      try {
        console.log(`Attempting to create model for user ${user_id}`);
        
        // Get user profile to check for style preferences from Supabase directly
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user_id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile from Supabase:', profileError);
        } else if (profile && profile.styles) {
          console.log('Found style preferences in profile:', profile.styles);
          
          // Ensure the styles are in the right format
          let styles = [];
          try {
            if (typeof profile.styles === 'string') {
              styles = JSON.parse(profile.styles);
            } else if (Array.isArray(profile.styles)) {
              styles = profile.styles;
            }
            
            if (styles.length > 0) {
              console.log(`Found ${styles.length} style preferences, triggering model creation...`);
              
              // Make sure the models directory exists and is writable
              const modelsDir = path.join(process.cwd(), 'recommender', 'models');
              if (!fs.existsSync(modelsDir)) {
                fs.mkdirSync(modelsDir, { recursive: true });
                console.log(`Created models directory at ${modelsDir}`);
              }
              
              // Trigger model creation
              const trainResponse = await fetch(`${req.nextUrl.origin}/api/user/style-interaction/train`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user_id: user_id,
                  liked: styles, // Use the user's style preferences as liked items
                  disliked: [],
                  saved: []
                })
              });
              
              const trainResult = await trainResponse.json();
              
              if (trainResponse.ok) {
                console.log('Model creation success:', trainResult);
                // Update model status
                hasModel = true;
              } else {
                console.error('Failed to create model:', trainResult);
              }
            }
          } catch (e) {
            console.error('Error parsing styles from profile:', e);
          }
        } else {
          console.log('No profile or styles found for user:', user_id);
        }
      } catch (error) {
        console.error('Error creating model:', error);
      }
    }

    if (!product_id && !user_id) {
      return NextResponse.json(
        { error: 'Missing either product_id or user_id' },
        { status: 400 }
      );
    }

    // Only fetch product if product_id is provided
    let product = null;
    if (product_id) {
      const { data: productData, error: productError } = await supabase
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

      if (!productData) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      product = productData;
    }

    // If we're fetching for a user without a personalized model,
    // we'll still try to get user preferences but clearly mark the response
    let userPreferences: string[] = [];
    let userMaterials: string[] = [];
    let userProfile = null;
    
    // Get user preferences from query params if provided
    const userPrefsParam = searchParams.get('user_preferences');
    const userMaterialsParam = searchParams.get('user_materials');
    
    if (userPrefsParam) {
      try {
        userPreferences = JSON.parse(userPrefsParam);
      } catch (e) {
        console.error('Error parsing user_preferences:', e);
      }
    }
    
    if (userMaterialsParam) {
      try {
        userMaterials = JSON.parse(userMaterialsParam);
      } catch (e) {
        console.error('Error parsing user_materials:', e);
      }
    }
    
    // Only fetch user profile from database if we have a user_id but no specified preferences
    if (user_id && (!userPrefsParam || !userMaterialsParam)) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user_id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
        } else if (data) {
          userProfile = data;
          
          // Parse style preferences if available
          if (!userPrefsParam && data.styles) {
            try {
              if (typeof data.styles === 'string') {
                userPreferences = JSON.parse(data.styles);
              } else if (Array.isArray(data.styles)) {
                userPreferences = data.styles;
              }
            } catch (e) {
              console.error('Error parsing user styles:', e);
            }
          }
          
          // Parse material preferences if available
          if (!userMaterialsParam && data.materials) {
            try {
              if (typeof data.materials === 'string') {
                userMaterials = JSON.parse(data.materials);
              } else if (Array.isArray(data.materials)) {
                userMaterials = data.materials;
              }
            } catch (e) {
              console.error('Error parsing user materials:', e);
            }
          }
        }
      } catch (e) {
        console.error('Error querying user profile:', e);
      }
    }
    
    // The style recommender script can use a personalized model if it exists
    const pythonPath = path.join(process.cwd(), 'env', 'bin', 'python');
    const scriptPath = path.join(process.cwd(), 'recommender', 'style_recommender.py');

    const args = [
      scriptPath,
      '--limit', limit,
    ];

    // Add product data if available
    if (product) {
      args.push('--product_data', JSON.stringify(product));
    }

    // We'll pass user preferences directly rather than having the Python script
    // fetch them again, for better efficiency
    if (userPreferences && userPreferences.length > 0) {
      args.push('--user_preferences', JSON.stringify(userPreferences));
    }
    
    if (userMaterials && userMaterials.length > 0) {
      args.push('--user_materials', JSON.stringify(userMaterials));
    }
    
    // Always pass user_id so the Python script can load a personalized model if it exists
    if (user_id) {
      args.push('--user_id', user_id);
    }

    console.log(`Running recommendation with args: ${args.join(' ')}`);
    
    const pythonProcess = spawn(pythonPath, args, {
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      }
    });

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Python error: ${data.toString()}`);
    });

    return new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}, errorOutput length: ${errorOutput.length}`);
        
        // Even with errors in stderr, we might still have valid output in stdout
        try {
          // Trim whitespace and check if result starts with '{'
          const trimmedResult = result.trim();
          if (!trimmedResult || !trimmedResult.startsWith('{')) {
            throw new Error(`Invalid JSON output: ${trimmedResult.substring(0, 50)}...`);
          }
          
          const recommendation = JSON.parse(trimmedResult);
          
          // Check if the recommendation is empty or has no results
          const hasRecommendations = 
            recommendation.recommendations?.length > 0 || 
            recommendation.data?.length > 0;
          
          // Add metadata about whether we used a personalized model
          const responseWithMetadata = {
            ...recommendation,
            meta: {
              is_personalized: hasModel,
              model_path: hasModel ? `recommender/models/${user_id}_model` : null,
              user_preferences: userPreferences,
              user_materials: userMaterials,
              timestamp: Date.now() // Add timestamp to prevent caching
            }
          };
          
          if (!hasRecommendations) {
            console.log('No recommendations returned from the model.');
            return resolve(NextResponse.json(
              { 
                error: 'The style recommender model did not return any recommendations.',
                recommendations: [],
                meta: {
                  is_personalized: hasModel,
                  error_details: 'Empty recommendations from model',
                  timestamp: Date.now() // Add timestamp
                }
              },
              { 
                status: 500,
                headers: {
                  'Cache-Control': 'no-store, max-age=0, must-revalidate'
                }
              }
            ));
          }
          
          resolve(NextResponse.json(responseWithMetadata, {
            headers: {
              'Cache-Control': 'no-store, max-age=0, must-revalidate'
            }
          }));
        } catch (e) {
          console.error('Error parsing recommendation result:', e);
          
          // If parsing the result failed, handle the error
          if (errorOutput.includes('SUPABASE_URL and SUPABASE_KEY must be set')) {
            resolve(NextResponse.json(
              { 
                error: 'Server configuration error: Missing Supabase credentials',
                recommendations: [],
                meta: {
                  is_personalized: hasModel,
                  error_details: 'Missing Supabase credentials'
                }
              },
              { status: 500 }
            ));
          } else {
            resolve(NextResponse.json(
              { 
                error: 'Failed to get style recommendations',
                errorDetails: errorOutput,
                recommendations: [],
                meta: {
                  is_personalized: hasModel,
                  error_details: errorOutput
                }
              },
              { status: 500 }
            ));
          }
        }
      });
    });
  } catch (error) {
    console.error('Error in style recommendation API:', error);
    return NextResponse.json(
      { error: 'Failed to process style recommendations' },
      { status: 500 }
    );
  }
}

// Helper function to check if a user has a personalized model
function checkUserModelExists(userId: string): boolean {
  if (!userId) return false;
  
  try {
    const modelPath = path.join(process.cwd(), 'recommender', 'models', `${userId}_model`);
    return fs.existsSync(modelPath);
  } catch (error) {
    console.error(`Error checking for user model ${userId}:`, error);
    return false;
  }
}
