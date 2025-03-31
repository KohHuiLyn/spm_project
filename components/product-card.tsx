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
  return (
    <Link href={`/product/${product.product_id}`} passHref>
    <div className="group relative overflow-hidden rounded bg-white">
      <div className="aspect-h-4 aspect-w-3 relative overflow-hidden">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 max-h-[450px]"
        />
        <button className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 text-black hover:bg-white">
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </button>
      </div>
      <div className="p-3">
        <h4 className="product-title">{product.name}</h4>
        <div className="mt-2 flex items-center gap-2">
          <span className="sale-price">S$ {product.price.toFixed(2)}</span>
          {product.originalPrice && <span className="original-price">$ {product.originalPrice.toFixed(2)}</span>}
          {product.discount && <span className="discount-tag">-{product.discount}%</span>}
        </div>
      </div>
      <div className="p-3 pt-0">
      <button
            className="w-full border border-black bg-white py-2 text-xs font-medium text-black hover:bg-black/5"
            onClick={(e) => e.preventDefault()} // prevent navigation on click
          >
            Add to Bag
          </button>
      </div>
    </div>
    </Link>
  )
}

