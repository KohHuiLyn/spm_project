import { supabase } from '../../../lib/supabase'
import { NextResponse } from 'next/server'
import { 
  viewAllProducts, 
  viewShopProducts, 
  findProductByName, 
  findProductsByPrice
} from "@/lib/controllers/productController";


export async function GET(req : Request) {
  const body = await req.json();
  const id = body.get("shop_id");
  const name = body.get("shop_name");
  const minPrice = body.get("minPrice");
  const maxPrice = body.get("maxPrice");
  if (id) {
    return NextResponse.json(viewShopProducts(id));
  } else if (name) { 
    return NextResponse.json(findProductByName(id));
  } else if (minPrice && maxPrice) {
    return NextResponse.json(findProductsByPrice({minPrice, maxPrice}));
  }
  
  // Return all product data
  return NextResponse.json(viewAllProducts());
}

// export async function POST(req : Request) {
//   const body = await req.json();
//   const { id, name } = body;
// }

// export async function PUT() {

// }

// GET /api/products
// To fetch all products from the products table
// export async function GET() {
//   const { data, error } = await supabase.from('products').select('*')
//   console.log('Data:', data)

//   // Log and return error if fetching fails
//   if (error) {
//     console.error('Supabase Error:', error.message)
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }

//   // Return product data
//   return NextResponse.json(data)
// }

