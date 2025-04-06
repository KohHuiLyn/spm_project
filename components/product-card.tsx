'use client'
import { Heart } from "lucide-react"
import Link from "next/link"

export interface Product {
  product_id: string
  name: string
  description?: string
  price: number
  image_url: string
  created_at: string // assuming ISO timestamp string from Supabase
  tag?: string
  quantity: number
  sizes_with_measurements?: Record<string, any> // or a more specific type if you know the structure
  colour?: string
}


export function ProductCard({ product }: { product: Product }) {
  // Format price safely with fallback to 0
  const formatPrice = (price: number | undefined) => {
    if (typeof price !== 'number') return '0.00';
    return price.toFixed(2);
  };

  return (
    <Link href={`/product/${product.product_id}`} passHref>
    <div className="group relative overflow-hidden rounded bg-white">
      <div className="aspect-h-4 aspect-w-3 relative overflow-hidden">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 max-h-[450px]"
        />
      </div>
      <div className="p-3">
      <div className="flex flex-row items-center justify-between">
  <h4 className="product-title">{product.name}</h4>
  <button className="flex items-center justify-center">
    <Heart className="h-4 w-4"  color="grey"/>
    <span className="sr-only">Add to wishlist</span>
  </button>
</div>


        <div className="mt-2 flex items-center gap-2" style={{fontWeight:'bold'}}>
          <span className="sale-price">S$ {formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="original-price">S$ {formatPrice(product.originalPrice)}</span>
          )}
          {product.discount && <span className="discount-tag">-{product.discount}%</span>}
        </div>
      </div>
      <div className="p-3 pt-0">
      </div>
    </div>
    </Link>
  )
}

