import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { 
  addPurchase, 
  viewUserOrders
} from "@/lib/controllers/orderController";

// POST /api/orders
// This is to insert a new order into the orders table
// export async function POST(req: Request) {
//     const body = await req.json()
//     const { user_id, product_id, size, quantity, total_price } = body

//     const { data, error } = await supabase.from('orders').insert({
//       user_id,
//       product_id,
//       size,
//       quantity,
//       total_price,
//     })

//     // Return error if insertion fails
//     if (error) return NextResponse.json({ error: error.message }, { status: 500 })

//     // Return the inserted order data
//     return NextResponse.json(data)
// }

// Only need POST to insert new purchased item and
// GET to retrieve the products that a user has purchased

export async function GET(req : Request) {
  const { searchParams } = new URL(req.url);
  // const purchaseData = {
    const user_id = searchParams.get("user_id");
    const product_id = searchParams.get("product_id");
    if (!user_id || !product_id) {
      return NextResponse.json({ error: "Missing user_id or product_id" }, { status: 400 });
    }
    // quantity: parseInt(searchParams.get("quantity") ?? "1"),
    // order_date: searchParams.get("order_date"),
    // price: parseFloat(searchParams.get("price") ?? "0")
  // };
  const result = await viewUserOrders({user_id : user_id});
  return NextResponse.json(result);

}

export async function POST(req: Request) {
  const body = await req.json();
  const { user_id, product_id, quantity, size, colour, price } = body;

  // Optional: Validate the inputs here

  const result = await addPurchase({
    user_id,
    product_id,
    quantity,
    size, 
    colour, 
    price
  });

  return NextResponse.json(result);
}