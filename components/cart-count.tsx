"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function CartIcon({ userId }: { userId: string | undefined }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    const fetchCartCount = async () => {
      const res = await fetch(`/api/cart?user_id=${userId}`)
      const data = await res.json()
      if (Array.isArray(data)) setCount(data.length)
    }

    fetchCartCount()
  }, [userId])

  return (
    <Link href="/cart" aria-label="Shopping Bag" className="relative">
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
          {count}
        </span>
      )}
    </Link>
  )
}
