import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/products
// To fetch all products from the products table
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '12';
    const order = searchParams.get('order') || 'name';
    const random = searchParams.get('random') === 'true';
    
    // Get filters if available
    const tag = searchParams.get('tag');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const material = searchParams.get('material');

    const supabase = await createClient();
    let query = supabase
      .from('products')
      .select('product_id, name, price, image_url, description, tag, material, colour');
      
    // Apply filters if provided
    if (tag) {
      query = query.eq('tag', tag);
    }
    
    if (material) {
      query = query.eq('material', material);
    }
    
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }
    
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }
    
    // Use random ordering if requested
    if (random) {
      // For Supabase, we can use built-in random function
      query = query.order('product_id', { ascending: false }).limit(100);
    } else {
      query = query.order(order);
    }
    
    // Apply limit last
    query = query.limit(parseInt(limit));
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Apply additional random shuffling if needed
    let finalData = data;
    if (random && finalData && finalData.length > 0) {
      finalData = [...finalData].sort(() => Math.random() - 0.5);
    }
    
    if (!finalData || finalData.length === 0) {
      console.log('No products found');
      // Return empty array instead of null
      return NextResponse.json({ data: [] });
    }
    
    return NextResponse.json({ data: finalData });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
