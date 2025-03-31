import Link from "next/link"
import { ChevronRight, Heart, Minus, Plus, Share2, ShoppingBag, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductOptions } from "@/components/product-options"
import { createClient } from "@/utils/supabase/server"
export default async function ProductPage({ params }: { params: { id: string } }) {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!params.id) {
    return redirect("/sign-in");
  }
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${params.id}`, {
      cache: 'no-store',
    })
    const product = await res.json()
    const measurementKeys = Object.keys(product.sizes_with_measurements).filter(k => k !== "UK" && k !== "US")

    console.log(product)
  return (
    <div className="flex min-h-screen flex-col">

      <div className="container px-4 py-6 md:px-6">
        <nav className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="transition-colors hover:text-foreground">
            Women
          </Link>

          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">T-Shirts</span>
        </nav>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium">{product.brand}</h2>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(4.6) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      } ${i === Math.floor(4.6) && product.rating % 1 > 0 ? "fill-yellow-400/50" : ""}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">10 reviews</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              {product.discount && (
                <span className="rounded-md bg-green-100 px-2 py-0.5 text-sm font-medium text-green-800">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            <Separator />
            <ProductOptions product={product} userId={user?.id}/>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">SKU:</span> 12345678
              </div>
              <Button variant="ghost" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
            <Separator />
            <Tabs defaultValue="description">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="sizes_with_measurements">Size Guide</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </TabsContent>
              <TabsContent value="sizes_with_measurements" className="mt-4">
  <div className="overflow-auto">
    <table className="min-w-full text-sm text-left text-muted-foreground border border-gray-300">
      <thead className="bg-gray-100 text-gray-700">
        <tr>
          <th className="px-4 py-2 border">Size</th>
          <th className="px-4 py-2 border">UK</th>
          <th className="px-4 py-2 border">US</th>
          {measurementKeys.map((key) => (
            <th key={key} className="px-4 py-2 border">{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {["XS", "S", "M", "L"].map((size) => (
          <tr key={size}>
            <td className="px-4 py-2 border font-medium">{size}</td>
            <td className="px-4 py-2 border">{product.sizes_with_measurements.UK?.[size] || "-"}</td>
            <td className="px-4 py-2 border">{product.sizes_with_measurements.US?.[size] || "-"}</td>
            {measurementKeys.map((key) => (
              <td key={key} className="px-4 py-2 border">
                {product.sizes_with_measurements[key]?.[size] || "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Customer Reviews</h3>
                    <Button size="sm">Write a Review</Button>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10"></div>
                        <div>
                          <p className="text-sm font-medium">John Doe</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < 5 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Great t-shirt! The material is soft and comfortable, and the fit is perfect. I ordered my usual
                      size and it fits just right. The color is exactly as shown in the picture. Highly recommend!
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10"></div>
                        <div>
                          <p className="text-sm font-medium">Jane Smith</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Nice quality t-shirt. The material is good and the stitching is well done. I would have given 5
                      stars but it runs a bit small, so I recommend sizing up if you prefer a looser fit.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Load More Reviews
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {relatedProducts.map((product) => (
              <div key={product.id} className="group relative overflow-hidden rounded-lg border bg-background">
                <div className="aspect-h-4 aspect-w-3 relative overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute right-2 top-2">
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/80 text-foreground">
                      <Heart className="h-4 w-4" />
                      <span className="sr-only">Add to wishlist</span>
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium">{product.brand}</h3>
                  <h4 className="mb-2 line-clamp-1 text-sm">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {product.discount && <span className="text-xs text-green-600">{product.discount}% OFF</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

// Sample data for related products
const relatedProducts = [
  {
    id: 2,
    name: "Classic Crew Neck T-Shirt",
    brand: "Adidas",
    price: 24.99,
    originalPrice: 34.99,
    discount: 28,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 3,
    name: "Graphic Print T-Shirt",
    brand: "Puma",
    price: 29.99,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 4,
    name: "V-Neck Cotton T-Shirt",
    brand: "H&M",
    price: 19.99,
    originalPrice: 24.99,
    discount: 20,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 5,
    name: "Long Sleeve T-Shirt",
    brand: "Nike",
    price: 34.99,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 6,
    name: "Striped Cotton T-Shirt",
    brand: "Zara",
    price: 27.99,
    originalPrice: 39.99,
    discount: 30,
    image: "/placeholder.svg?height=300&width=300",
  },
]

