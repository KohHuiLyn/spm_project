import { supabase } from "@/lib/supabase";

// GET: Get a specific cart item (e.g. by user & product)
export async function getCartItem(user_id: string, product_id: string) {
  return await supabase
    .from("cart")
    .select("*")
    .eq("user_id", user_id)
    .eq("product_id", product_id)
    .single();
}

// GETALL: Get full cart for a user
export async function getCartByUser(user_id: string) {
  return await supabase
    .from("cart")
    .select("*")
    .eq("user_id", user_id);
}

// POST: Add a new item to cart
export async function createCartItem(user_id: string, product_id: string, quantity: number, size: string, colour: string) {
  // Need to check for existing items
  return await supabase.from("cart").insert([
    {
      user_id,
      product_id,
      quantity,
      size,
      colour
    },
  ]);
}

// PUT: Update quantity of existing cart item
export async function updateCartItem(id: string, quantity: number) {
  return await supabase
    .from("cart")
    .update({ quantity })
    .eq("id", id);
}

// Update quantity (PUT)
export async function setCartItemQuantity(id: string, quantity: number) {
    return await supabase
      .from("cart")
      .update({ quantity })
      .eq("id", id);
  }

// DELETE: Remove item from cart
export async function deleteCartItem(id: string) {
  return await supabase
      .from("cart")
      .delete()
      .eq("id", id);
}

// Clear all cart items for a user
export async function clearCartByUser(user_id: string) {
    return await supabase
      .from("cart")
      .delete()
      .eq("user_id", user_id);
  }