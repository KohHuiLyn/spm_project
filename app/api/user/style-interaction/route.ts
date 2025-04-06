import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { createClient } from '@/utils/supabase/server';

// Threshold for retraining (for testing, set to 2)
const RETRAIN_THRESHOLD = 2;

// Helper function to ensure table exists
async function ensureTableExists() {
  try {
    const supabase = await createClient();
    
    // Check if table exists by attempting to select from it
    const { error } = await supabase.from('style_interactions').select('id', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') { // Table doesn't exist error code
      console.log('Creating style_interactions table...');
      
      // Use direct SQL query instead of RPC
      const { error: createError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.style_interactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          product_id TEXT NOT NULL,
          product_name TEXT,
          product_description TEXT,
          action TEXT NOT NULL CHECK (action IN ('like', 'dislike', 'save')),
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_style_interactions_user_id ON public.style_interactions(user_id);
      `);
      
      if (createError) {
        console.error('Error creating table via SQL:', createError);
        return false;
      }
      
      console.log('Table created successfully');
      return true;
    }
    
    return true; // Table already exists
  } catch (error) {
    console.error('Error checking/creating table:', error);
    return false;
  }
}

// POST /api/user/style-interaction
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { 
      user_id,
      product_id, 
      product_name, 
      product_description, 
      interaction_type 
    } = body;
    
    if (!user_id || !product_id || !interaction_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!['like', 'dislike', 'save'].includes(interaction_type)) {
      return NextResponse.json(
        { error: 'Invalid interaction type' },
        { status: 400 }
      );
    }
    
    // Store interaction in Supabase
    const supabase = await createClient();
    
    // Ensure table exists before inserting
    await ensureTableExists();
    
    // Insert the interaction
    const { data, error } = await supabase
      .from('style_interactions')
      .insert({
        user_id,
        product_id,
        product_name: product_name || '',
        product_description: product_description || '',
        action: interaction_type,
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error storing interaction:', error);
      return NextResponse.json(
        { error: 'Failed to store interaction' },
        { status: 500 }
      );
    }
    
    // Get total interactions count
    const { data: interactions, error: countError } = await supabase
      .from('style_interactions')
      .select('*')
      .eq('user_id', user_id);
    
    if (countError) {
      console.error('Error counting interactions:', countError);
      return NextResponse.json(
        { error: 'Failed to count interactions' },
        { status: 500 }
      );
    }
    
    const totalInteractions = interactions?.length || 0;
    console.log(`User ${user_id} ${interaction_type}d product ${product_id}, total interactions: ${totalInteractions}`);
    
    // Check if we need to retrain
    let retrainTriggered = false;
    if (totalInteractions >= RETRAIN_THRESHOLD) {
      // Check if we have a model already
      const modelPath = path.join(process.cwd(), 'models', `${user_id}_model`);
      const hasModel = fs.existsSync(modelPath);
      
      // If no model or it's time to retrain
      if (!hasModel || totalInteractions % RETRAIN_THRESHOLD === 0) {
        // Trigger retraining in the background
        retrainTriggered = true;
        retrainUserModel(user_id);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Interaction recorded: ${interaction_type}`,
      retrain_triggered: retrainTriggered,
      interaction_count: totalInteractions
    });
    
  } catch (error) {
    console.error('Error in style interaction API:', error);
    return NextResponse.json(
      { error: 'Failed to process style interaction' },
      { status: 500 }
    );
  }
}

// Retraining function
async function retrainUserModel(userId: string) {
  try {
    console.log(`Starting model retraining for user ${userId}`);
    
    // Get all user interactions
    const supabase = await createClient();
    const { data: interactions, error } = await supabase
      .from('style_interactions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching interactions for retraining:', error);
      return false;
    }
    
    // Extract liked, disliked and saved descriptions
    const likedProducts = interactions?.filter(i => i.action === 'like') || [];
    const dislikedProducts = interactions?.filter(i => i.action === 'dislike') || [];
    const savedProducts = interactions?.filter(i => i.action === 'save') || [];
    
    const likedDescriptions = likedProducts.map(p => p.product_description || p.product_name);
    const dislikedDescriptions = dislikedProducts.map(p => p.product_description || p.product_name);
    const savedDescriptions = savedProducts.map(p => p.product_description || p.product_name);
    
    // Run the retrain script
    const pythonPath = path.join(process.cwd(), 'env', 'bin', 'python');
    const scriptPath = path.join(process.cwd(), 'recommender', 'retrain_model.py');
    
    // Prepare arguments
    const args = [scriptPath, userId];
    
    // Add liked items
    if (likedDescriptions.length > 0) {
      args.push('--liked', JSON.stringify(likedDescriptions));
    }
    
    // Add disliked items
    if (dislikedDescriptions.length > 0) {
      args.push('--disliked', JSON.stringify(dislikedDescriptions));
    }
    
    // Add saved items
    if (savedDescriptions.length > 0) {
      args.push('--saved', JSON.stringify(savedDescriptions));
    }
    
    console.log(`Running retraining command: ${pythonPath} ${args.join(' ')}`);
    
    const pythonProcess = spawn(pythonPath, args, {
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        PATH: process.env.PATH || ''
      }
    });
    
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Retraining stdout: ${data}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Retraining stderr: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`Retraining process exited with code ${code}`);
    });
    
    return true;
  } catch (error) {
    console.error('Error retraining model:', error);
    return false;
  }
} 