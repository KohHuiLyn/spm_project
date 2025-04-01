import {
    getCartItem,
    getCartByUser,
    createCartItem,
    updateCartItem,
    deleteCartItem,
    clearCartByUser, 
    setCartItemQuantity
  } from "@/lib/models/cartModel";
  
  // Pressing add to cart in product page
export async function addToCart({ user_id, product_id, quantity, size, colour }: {
  user_id: string;
  product_id: string;
  quantity: number;
  size: string;
  colour: string;
}) {
  try {
    const { data: existingItem } = await getCartItem(user_id, product_id);

    if (existingItem) {
      // If item exists, update the quantity
      const newQty = existingItem.quantity + quantity;
      const { data } = await updateCartItem(existingItem.id, newQty);

      return new Response(JSON.stringify(data), { status: 200 });
    } else {
      // Item doesn't exist, create new
      const { data, error } = await createCartItem(user_id, product_id, quantity, size, colour);
      if (error) throw new Error(error.message);
      
      return new Response(JSON.stringify(data), { status: 201 });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

  // PUT: Set specific quantity (not add)
  // Updates the cart qty in cart
    export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
    try {
      const { data, error } = await setCartItemQuantity(cartItemId, quantity);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  
  export async function viewCart(user_id: string) {
    try {
      const { data, error } = await getCartByUser(user_id);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  
  export async function removeCartItem(cartItemId: string) {
    try {
      const { data, error } = await deleteCartItem(cartItemId);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  
  // Clear cart
    export async function clearCart(user_id: string) {
    try {
      const { data, error } = await clearCartByUser(user_id);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }