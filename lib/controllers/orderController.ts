import { 
    getOrdersByUserID,
    createOrder,
    updateOrder,
    getSpecificOrder
} from '@/lib/models/orderModel';

import { supabase } from '../supabase';

type PurchaseData = {
    user_id: string;
    product_id: string;
    quantity: number;
    order_date: string;
    price: number;
  };

// export async function addPurchase(data: PurchaseData) {
//     // const { data: result, error } = await supabase
//     //   .from("order_tracking")
//     //   .insert([data]);
  
//     // if (error) throw new Error(error.message);
//     // return result;
// }

export async function addPurchase({ user_id, product_id, quantity, size, colour, price}: {
  user_id: string;
  product_id: string;
  quantity: number;
  size: string;
  colour: string;
  price : number;
}) {
  try {
    const existingItem = await findSpecificUserOrder({user_id, product_id, size, colour} );
    // const existingItem = await response.json();

    if (existingItem) {
      // If item exists, update the quantity
      const newQty = existingItem.quantity + quantity;
      const { data } = await updateOrder(existingItem.order_id, newQty);
      return new Response(JSON.stringify(data), { status: 200 });
    } else {
      const { data, error } = await createOrder(user_id, product_id, quantity, size, colour, price);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), { status: 201 });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Helper function
export async function findSpecificUserOrder({ user_id, product_id, size, colour}: { user_id: string, product_id : string, size : string, colour : string}) {
    const { data, error } = await getSpecificOrder(user_id, product_id, size, colour);
    if (error) throw new Error(error.message);
    return data; // just return the raw data
  }

export async function viewUserOrders({user_id} : {user_id : string}) {
    try {
            const { data,  error } = await getOrdersByUserID(user_id);
            if (error) throw new Error(error.message);
            return new Response(JSON.stringify(data), { status: 200 });
        } catch (error : any) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
}