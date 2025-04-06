import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import path from 'path';
import fs from 'fs';

// Constants
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

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id parameter' },
        { status: 400 }
      );
    }
    
    // Check if user has a personalized model
    const hasModel = checkUserModelExists(user_id);
    
    // Get user's style interactions count
    const supabase = await createClient();
    const { data: interactions, error } = await supabase
      .from('style_interactions')
      .select('*')
      .eq('user_id', user_id);
    
    if (error) {
      console.error('Error fetching interactions:', error);
      // Instead of returning an error, return default values
      // This allows the app to continue working even without the database table
      return NextResponse.json({
        hasPersonalizedModel: hasModel,
        likeCount: 0,
        dislikeCount: 0,
        saveCount: 0,
        totalCount: 0,
        interactionsUntilNextTrain: hasModel ? RETRAIN_THRESHOLD : RETRAIN_THRESHOLD,
        modelMetadata: hasModel ? getModelMetadata(user_id) : null
      });
    }
    
    // Count interactions by type
    const likeCount = interactions?.filter(i => i.action === 'like').length || 0;
    const dislikeCount = interactions?.filter(i => i.action === 'dislike').length || 0;
    const saveCount = interactions?.filter(i => i.action === 'save').length || 0;
    const totalCount = interactions?.length || 0;
    
    // Get model metadata if available
    let modelMetadata = null;
    if (hasModel) {
      const metadataPath = path.join(process.cwd(), 'models', `${user_id}_model`, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        try {
          const metadataStr = fs.readFileSync(metadataPath, 'utf-8');
          modelMetadata = JSON.parse(metadataStr);
        } catch (e) {
          console.error('Error reading model metadata:', e);
        }
      }
    }

    // Calculate interactions until next train
    const interactionsUntilNextTrain = hasModel ? 
      (RETRAIN_THRESHOLD - (totalCount % RETRAIN_THRESHOLD)) : 
      (RETRAIN_THRESHOLD - totalCount);

    return NextResponse.json({
      hasPersonalizedModel: hasModel,
      likeCount,
      dislikeCount,
      saveCount,
      totalCount,
      interactionsUntilNextTrain,
      modelMetadata
    });
    
  } catch (error) {
    console.error('Error in style interaction stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interaction stats' },
      { status: 500 }
    );
  }
}

function checkUserModelExists(userId: string): boolean {
  if (!userId) return false;
  
  try {
    const modelPath = path.join(process.cwd(), 'models', `${userId}_model`);
    return fs.existsSync(modelPath);
  } catch (error) {
    console.error(`Error checking for user model ${userId}:`, error);
    return false;
  }
}

function getModelMetadata(userId: string): any {
  const metadataPath = path.join(process.cwd(), 'models', `${userId}_model`, 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    try {
      const metadataStr = fs.readFileSync(metadataPath, 'utf-8');
      return JSON.parse(metadataStr);
    } catch (e) {
      console.error('Error reading model metadata:', e);
      return null;
    }
  }
  return null;
} 