import Link from "next/link"
import { ChevronRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { redirect } from "next/navigation"
import { recommendedProducts } from "@/lib/data";

export default async function CartPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const userId = user.id // Replace this with logic to get actual logged-in user
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart?user_id=${userId}`, {
    cache: "no-store",
  })

  const cartItems = await res.json()

  const subtotal = cartItems.reduce((total: number, item: any) => {
    return total + item.products.price * item.quantity
  }, 0)

  const shipping = 4.99
  const total = subtotal + shipping

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container px-4 py-6 md:px-6">
        <div className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Shopping Cart</span>
        </div>

        <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* LEFT: CART LIST */}
          <div className="lg:col-span-2">
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="rounded-lg border bg-background p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-24 w-24 overflow-hidden rounded-md">
                        <img
                          src={item.products.image_url || "/placeholder.svg"}
                          alt={item.products.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-sm font-medium">{item.products.brand}</h3>
                            <h2 className="text-base font-semibold">{item.products.name}</h2>
                            <div className="mt-1 text-sm text-muted-foreground">
                              <span>Size: {item.size}</span>
                              <span className="mx-2">|</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0 sm:text-right">
                            <div className="text-base font-semibold">
                              ${(item.products.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${item.products.price.toFixed(2)} each
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                          {/* Add +/- logic later if needed */}
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-md">
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-md">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-8 text-center">
                <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
                <p className="mb-6 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
                <Button asChild>
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            )}
          </div>

          {/* RIGHT: SUMMARY */}
          <div>
            <div className="sticky top-24 rounded-lg border bg-background p-6">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button className="mt-6 w-full">Proceed to Checkout</Button>
            </div>
          </div>

        </div>
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {recommendedProducts.map((product) => (
              <div key={product.id} className="group relative overflow-hidden rounded-lg border bg-background">
                <div className="aspect-h-4 aspect-w-3 relative overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium">{product.brand}</h3>
                  <h4 className="mb-2 line-clamp-1 text-sm">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">${product.price.toFixed(2)}</span>
                    {product.discount && <span className="text-xs text-green-600">{product.discount}% OFF</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// You’ll need to replace this with actual logic to get user ID from cookie/session
function getUserId() {
  // For now just return a hardcoded user_id
  return "e932f5dc-949c-4341-9237-27126ef03bbb"
}
