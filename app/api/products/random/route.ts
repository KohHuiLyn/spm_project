import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// This API endpoint returns random products for the style swiper
export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Path to the data directory and catalog file
    const dataDir = path.join(process.cwd(), 'recommender', 'data');
    const catalogPath = path.join(dataDir, 'combined_cleaned_latest.csv');
    
    // Check if catalog exists
    if (!fs.existsSync(catalogPath)) {
      return NextResponse.json(
        { error: 'Product catalog not found' },
        { status: 500 }
      );
    }
    
    // Read catalog file
    const catalog = fs.readFileSync(catalogPath, 'utf-8');
    const lines = catalog.split('\n');
    const headers = lines[0].split(',');
    
    // Parse headers to know the column indices
    const productIdIndex = headers.indexOf('product_id');
    const nameIndex = headers.indexOf('name');
    const priceIndex = headers.indexOf('price');
    const imageUrlIndex = headers.indexOf('image_url');
    const categoryIndex = headers.indexOf('category');
    const descriptionIndex = headers.indexOf('description');
    const materialIndex = headers.indexOf('material');
    
    // Create array of all valid products
    const products = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV - handle commas within quoted fields
      const values = [];
      let inQuotes = false;
      let currentValue = '';
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue); // Add the last field
      
      // Only include products with an image URL and product ID
      if (values[productIdIndex] && values[imageUrlIndex]) {
        products.push({
          product_id: values[productIdIndex],
          name: values[nameIndex] || 'Unnamed Product',
          price: parseFloat(values[priceIndex]) || 0,
          image_url: values[imageUrlIndex],
          category: values[categoryIndex] || '',
          description: values[descriptionIndex] || '',
          material: values[materialIndex] || ''
        });
      }
    }
    
    // Shuffle array to get random products
    const shuffled = products.sort(() => 0.5 - Math.random());
    
    // Get limited number of products
    const randomProducts = shuffled.slice(0, limit);
    
    console.log(`Returning ${randomProducts.length} random products`);
    
    return NextResponse.json(randomProducts);
    
  } catch (error) {
    console.error('Error getting random products:', error);
    return NextResponse.json(
      { error: 'Failed to get random products', details: String(error) },
      { status: 500 }
    );
  }
} 