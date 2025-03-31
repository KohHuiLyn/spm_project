
import Image from "next/image"
import Link from "next/link"
import { categories } from "@/lib/data"
import { ProductCard } from "@/components/product-card"

export default async function Home() {

  // TO DO: REPLACE WITH RECOMMENDED SHIRTS
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
    cache: "no-store",
  })

  const products = await res.json()
  console.log(products)
  return (
    <div className="flex flex-col">
      <section className="w-full py-6 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="relative h-[500px] w-full overflow-hidden rounded-lg">
          <div className="relative h-[500px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/banner.jpeg"
                alt="Hero Banner"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 flex flex-col items-start justify-center bg-gradient-to-r from-black/50 to-transparent p-8 text-white">
                <h1 className="mb-4 text-4xl font-bold">NEW ARRIVALS</h1>
                <p className="mb-6 max-w-md text-lg">Discover the latest fashion trends for this season</p>
                <button className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded-md">SHOP NOW</button>
              </div>
            </div>

            <div className="absolute inset-0 flex flex-col items-start justify-center bg-gradient-to-r from-black/50 to-transparent p-8 text-white">
              <h1 className="mb-4 text-4xl font-bold">NEW ARRIVALS</h1>
              <p className="mb-6 max-w-md text-lg">Discover the latest fashion trends for this season</p>
              <button className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded-md">SHOP NOW</button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Link href="#" className="text-blue-600 hover:underline flex items-center gap-1">
              View All
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <Link key={category.name} href={category.href} className="group flex flex-col items-center text-center">
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                style={{borderRadius:'100000px', maxHeight:'18vh', maxWidth:'18vh', marginBottom:'0.5rem'}}
                className="h-full w-full object-cover"
              />
                <h3 className="font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-12">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-6">For you</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 " >
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
        </div>
      </section>

      <section className="w-full bg-gray-100 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg bg-gray-200 h-64 flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                <h3 className="mb-2 text-xl font-bold">Women's Fashion</h3>
                <p className="mb-4">Up to 50% off on selected items</p>
                <button className="border border-white text-white hover:bg-white hover:text-black px-4 py-2 rounded-md">
                  Shop Now
                </button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-gray-200 h-64 flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                <h3 className="mb-2 text-xl font-bold">Men's Collection</h3>
                <p className="mb-4">New arrivals for summer</p>
                <button className="border border-white text-white hover:bg-white hover:text-black px-4 py-2 rounded-md">
                  Shop Now
                </button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-gray-200 h-64 flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                <h3 className="mb-2 text-xl font-bold">Accessories</h3>
                <p className="mb-4">Complete your look</p>
                <button className="border border-white text-white hover:bg-white hover:text-black px-4 py-2 rounded-md">
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}



