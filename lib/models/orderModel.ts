import { supabase } from "@/lib/supabase";
export async function getOrdersByUserID (user_id : string) {
    return await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user_id)
    .single();
}

export async function createOrder (user_id : string, product_id: string, quantity : number, size: string, colour: string, price : number) {
    return await supabase.from("orders").insert([
        {
          user_id,
          product_id,
          quantity,
          size,
          colour
        },
      ]);
}

export async function updateOrder (order_id : string, newQty : string) {
    return await supabase
    .from("cart")
    .update({ newQty })
    .eq("id", order_id);
}

export async function getSpecificOrder (user_id : string, product_id: string, size: string, colour: string) {
    return await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user_id)
    .eq("user_id", product_id)
    .eq("user_id", size)
    .eq("user_id", colour)
    .single();
}