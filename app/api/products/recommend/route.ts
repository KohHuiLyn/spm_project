import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// POST /api/products/recommend/size
// Get size recommendation for a product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_height, user_weight, product_id } = body;
    
    // Validate required fields
    if (!user_height || !user_weight || !product_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_height, user_weight, product_id' },
        { status: 400 }
      );
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

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Run Python script for size recommendation
    const pythonPath = path.join(process.cwd(), 'env', 'bin', 'python');

    const scriptPath = path.join(process.cwd(), 'recommender', 'size_recommender.py');

    console.log(`Running size recommender script: ${scriptPath}`);
    console.log(`User height: ${user_height}, User weight: ${user_weight}`);

    const pythonProcess = spawn(pythonPath, [
      scriptPath,
      '--height', user_height.toString(),
      '--weight', user_weight.toString(),
      '--product_data', JSON.stringify(product)
    ]);

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
        console.log(`Python process exited with code ${code}`);
        
        if (code !== 0 || errorOutput) {
          try {
            // Try to parse error as JSON
            const errorJson = JSON.parse(errorOutput);
            resolve(NextResponse.json(
              { error: errorJson.error || 'Failed to get size recommendation' },
              { status: 500 }
            ));
          } catch (e) {
            // If not valid JSON, return raw error
            resolve(NextResponse.json(
              { error: errorOutput || 'Failed to get size recommendation' },
              { status: 500 }
            ));
          }
        } else {
          try {
            const recommendation = JSON.parse(result);
            resolve(NextResponse.json(recommendation));
          } catch (e) {
            console.error('Error parsing recommendation result:', e);
            resolve(NextResponse.json(
              { error: 'Invalid response from recommender' },
              { status: 500 }
            ));
          }
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

// GET /api/products/recommend/style?product_id=xxx
// Get style recommendations for a product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const product_id = searchParams.get('product_id');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!product_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: product_id' },
        { status: 400 }
      );
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

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Run Python script for style recommendations
    const pythonPath = path.join(process.cwd(), 'env', 'bin', 'python');

    const scriptPath = path.join(process.cwd(), 'recommender', 'style_recommender.py');

    console.log(`Running style recommender script: ${scriptPath}`);
    console.log(`Product ID: ${product_id}, Limit: ${limit}`);

    const pythonProcess = spawn(pythonPath, [
      scriptPath,
      '--product_data', JSON.stringify(product),
      '--limit', limit.toString()
    ]);

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
        console.log(`Python process exited with code ${code}`);
        
        if (code !== 0 || errorOutput) {
          try {
            // Try to parse error as JSON
            const errorJson = JSON.parse(errorOutput);
            resolve(NextResponse.json(
              { error: errorJson.error || 'Failed to get style recommendations' },
              { status: 500 }
            ));
          } catch (e) {
            // If not valid JSON, return raw error
            resolve(NextResponse.json(
              { error: errorOutput || 'Failed to get style recommendations' },
              { status: 500 }
            ));
          }
        } else {
          try {
            const recommendations = JSON.parse(result);
            resolve(NextResponse.json(recommendations));
          } catch (e) {
            console.error('Error parsing recommendation result:', e);
            resolve(NextResponse.json(
              { error: 'Invalid response from recommender' },
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