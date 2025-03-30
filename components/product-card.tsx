import { Heart } from "lucide-react"

interface Product {
  id: number
  name: string
  brand: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative overflow-hidden rounded bg-white">
      <div className="aspect-h-4 aspect-w-3 relative overflow-hidden">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 max-h-[450px]"
        />
        <button className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 text-black hover:bg-white">
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </button>
      </div>
      <div className="p-3">
        <h3 className="product-brand">{product.brand}</h3>
        <h4 className="product-title">{product.name}</h4>
        <div className="mt-2 flex items-center gap-2">
          <span className="sale-price">S$ {product.price.toFixed(2)}</span>
          {product.originalPrice && <span className="original-price">S$ {product.originalPrice.toFixed(2)}</span>}
          {product.discount && <span className="discount-tag">-{product.discount}%</span>}
        </div>
      </div>
      <div className="p-3 pt-0">
        <button className="w-full border border-black bg-white py-2 text-xs font-medium text-black hover:bg-black/5">
          Add to Bag
        </button>
      </div>
    </div>
  )
}

