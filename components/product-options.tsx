"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { colorNameToHex, parseColours, sortSizes } from "@/lib/utils"
import { redirect } from "next/navigation"
interface ProductOptionsProps {
    product: any
    userId: string
  }

export function ProductOptions({ product, userId }: ProductOptionsProps) {
  const colours = parseColours(product.colour)
  const sortedSizes = sortSizes(Object.keys(product.sizes_with_measurements?.UK || {}))

  const [selectedColor, setSelectedColor] = useState(colours[0] || "")
  const [selectedSize, setSelectedSize] = useState(sortedSizes[0] || "")
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = async () => {
    
    if (!userId) {
    return redirect("/sign-in");
    }
    const payload = {
    user_id: userId,
      product_id: product.product_id,
      name: product.name,
      image: product.image_url,
      price: product.price,
      colour: selectedColor,
      size: selectedSize,
      quantity,
    }

    console.log("Add to cart payload:", payload)

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    
      const result = await res.json()
      console.log('Cart updated:', result)
      return redirect("/cart")
  }

  return (
    <div className="space-y-6">
      {/* Color */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colours.map((c) => {
            const hex = colorNameToHex[c.toLowerCase()] || "#ccc"
            const isSelected = selectedColor === c
            return (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`w-6 h-6 rounded-full border-2 ${isSelected ? "border-black" : "border-gray-300"}`}
                style={{ backgroundColor: hex }}
                title={c}
              />
            )
          })}
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sortedSizes.map((size) => (
            <Button
              key={size}
              variant={selectedSize === size ? "default" : "outline"}
              className="w-12 rounded-md"
              size="sm"
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Quantity</h3>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setQuantity((q) => Math.max(1, q - 1))} variant="outline" size="icon" className="h-8 w-8 rounded-md">
            <Minus className="h-3 w-3" />
            <span className="sr-only">Decrease quantity</span>
          </Button>
          <span className="w-12 text-center">{quantity}</span>
          <Button onClick={() => setQuantity((q) => q + 1)} variant="outline" size="icon" className="h-8 w-8 rounded-md">
            <Plus className="h-3 w-3" />
            <span className="sr-only">Increase quantity</span>
          </Button>
        </div>
      </div>

      {/* Add to Cart */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
        <Button className="flex-1" onClick={handleAddToCart}>
          Add to Cart
        </Button>
        <Button variant="outline" className="flex-1">
          Wishlist
        </Button>
      </div>
    </div>
  )
}
