import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// This endpoint triggers model retraining for a user's style preferences
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { 
      user_id,
      liked,
      disliked,
      saved
    } = body;
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required user_id parameter' },
        { status: 400 }
      );
    }
    
    // Modified check - either need liked items OR at least a combination of other preferences
    const hasLikedItems = liked && liked.length > 0;
    const hasDislikedItems = disliked && disliked.length > 0;
    const hasSavedItems = saved && saved.length > 0;
    
    if (!hasLikedItems && !hasDislikedItems && !hasSavedItems) {
      return NextResponse.json(
        { error: 'At least some interaction data is required for training' },
        { status: 400 }
      );
    }
    
    // If no liked items but we have other interactions, create a synthetic liked item
    let likedForTraining = liked || [];
    if (!hasLikedItems && (hasDislikedItems || hasSavedItems)) {
      console.log("No liked items provided; using a synthetic liked item for training");
      likedForTraining = ["neutral style item"];
    }
    
    console.log(`Starting model retraining for user ${user_id} with:
      - ${hasLikedItems ? liked.length : '0 real + 1 synthetic'} liked descriptions
      - ${disliked?.length || 0} disliked descriptions
      - ${saved?.length || 0} saved descriptions
    `);
    
    // Create models directory if needed
    const modelsDir = path.join(process.cwd(), 'models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }
    
    // Run the retrain script using python in the project environment
    const pythonPath = process.env.NODE_ENV === 'production' 
      ? 'python3'  // Use system python in production
      : path.join(process.cwd(), 'env', 'bin', 'python');  // Use venv in dev
    
    const scriptPath = path.join(process.cwd(), 'recommender', 'retrain_model.py');
    
    // Prepare arguments
    const args = [scriptPath, user_id];
    
    // Add liked items - use our potentially modified list
    if (likedForTraining.length > 0) {
      args.push('--liked', JSON.stringify(likedForTraining));
    }
    
    // Add disliked items
    if (disliked && disliked.length > 0) {
      args.push('--disliked', JSON.stringify(disliked));
    }
    
    // Add saved items
    if (saved && saved.length > 0) {
      args.push('--saved', JSON.stringify(saved));
    }
    
    console.log(`Running retraining command: ${pythonPath} ${args.join(' ')}`);
    
    // Run the retraining script
    const retrainProcess = spawn(pythonPath, args);
    
    // Handle process output
    retrainProcess.stdout.on('data', (data) => {
      console.log(`Retraining output: ${data}`);
    });
    
    retrainProcess.stderr.on('data', (data) => {
      console.error(`Retraining error: ${data}`);
    });
    
    // Wait for process to complete
    let success = false;
    let error = null;

    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.log("Training taking too long, stopping the process");
          retrainProcess.kill();
          resolve(); // Don't reject, just move on
        }, 30000); // 30 second timeout
        
        retrainProcess.on('close', (code) => {
          clearTimeout(timeout);
          if (code === 0) {
            success = true;
            resolve();
          } else {
            error = `Retraining process exited with code ${code}`;
            console.error(error);
            // Don't reject - still consider it handled
            resolve();
          }
        });
      });
    } catch (e) {
      console.error("Error waiting for retraining process:", e);
    }

    // Even if training failed, check if the model directory exists
    const userModelDir = path.join(process.cwd(), 'models', `${user_id}_model`);
    const modelExists = fs.existsSync(userModelDir);

    console.log(`Training ${success ? 'succeeded' : 'failed'}, model directory ${modelExists ? 'exists' : 'does not exist'}`);

    // Return success if either the process succeeded or the model exists
    return NextResponse.json({
      success: success || modelExists,
      modelExists: modelExists,
      error: error,
      message: success ? 'Model retraining completed successfully' : 
        (modelExists ? 'Model exists despite training issues' : 'Failed to train model')
    });
    
  } catch (error) {
    console.error('Error in training endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to retrain model' },
      { status: 500 }
    );
  }
} 