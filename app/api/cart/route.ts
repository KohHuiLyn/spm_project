import { 
    addToCart, 
    viewCart, 
    removeCartItem, 
    clearCart,
    updateCartItemQuantity
} from "@/lib/controllers/cartController";

export async function POST(req: Request) {
  const body = await req.json();
  return addToCart(body);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  // Validate Input
  if (!user_id) return new Response(JSON.stringify({ error: "Missing user_id" }), { status: 400 });
  

  return viewCart(user_id);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const user_id = searchParams.get("user_id");

  // If cart item id is provided, delete one item
  if (id) {
    return removeCartItem(id);
  }

  // If user_id is provided, clear entire cart
  if (user_id) {
    return clearCart(user_id);
  }

  return new Response(JSON.stringify({ error: "Missing id or user_id" }), { status: 400 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { cartItemId, quantity } = body;

  if (!cartItemId || typeof quantity !== "number") {
    return new Response(JSON.stringify({ error: "Missing cartItemId or quantity" }), { status: 400 });
  }

  return updateCartItemQuantity(cartItemId, quantity);
}


// import { supabase } from '@/lib/supabase'
// import { NextResponse } from 'next/server'

// /**
//  * GET /api/cart?user_id=xxx
//  * Purpose: Retrieve all items in a user's cart
//  * - Joins with the `products` table to include product details
//  * - Requires a `user_id` query parameter
//  */
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url)
//   const userId = searchParams.get('user_id')

//   // Validate input
//   if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

//   // Fetch cart items for this user and join product info
//   const { data, error } = await supabase
//     .from('cart_items')
//     .select('*, products(*)') // Join with product data
//     .eq('user_id', userId)

//   // Return error if query fails
//   if (error) return NextResponse.json({ error: error.message }, { status: 500 })

//   // Return cart data
//   return NextResponse.json(data)
// }

// /**
//  * POST /api/cart
//  * Purpose: Add or update an item in the user's cart
//  * - Uses upsert to prevent duplicate (user + product + size)
//  * - Expects: user_id, product_id, size, quantity in body
//  */
// export async function POST(req: Request) {
//   const body = await req.json()
//   const { user_id, product_id, size, quantity } = body

//   // Add or update cart item (if already exists with same user/product/size combo)
//   const { data, error } = await supabase.from('cart_items').upsert({
//     user_id,
//     product_id,
//     size,
//     quantity,
//   })

//   // Return error if insert/update fails
//   if (error) return NextResponse.json({ error: error.message }, { status: 500 })

//   // Return the upserted cart item
//   return NextResponse.json(data)
// }
