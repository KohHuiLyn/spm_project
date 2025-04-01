import { supabase } from '../../../../lib/supabase'
import { NextResponse } from 'next/server'
import { 
  viewAllProducts, 
  viewShopProducts, 
  findProductByName, 
  findProductsByPrice
} from "@/lib/controllers/productController";

// Should do fetching by params or by JSON
// export async function GET(req: Request, { params }: { params: { id: string } }) {
//     const { id } = params;
//     // Fetch product by ID
//   }

export async function GET(req: Request,
  { params }: { params: { shop_id: string } }) {
  const { searchParams } = new URL(req.url);

  // const id = searchParams.get("shop_id");
  const { shop_id } = params;
  // const name = searchParams.get("shop_name");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  // if (id) {
  //   return NextResponse.json(viewShopProducts({shop_id : id}));
  // }

  // if (name) {
  //   return NextResponse.json(findProductByName({shop_name : name}));
  // }

  if (minPrice && maxPrice) {
    return NextResponse.json(findProductsByPrice({ minPrice : parseFloat(minPrice), maxPrice : parseFloat(maxPrice) }));
  }

  // Default: Return all products in shop id in path
  return NextResponse.json(viewShopProducts({shop_id}));
}