import Link from "next/link"
import { ChevronDown, ChevronRight, Filter, Heart, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { ProductCard } from "@/components/product-card"
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const category = params.category
  // TO DO: REPLACE WITH RECOMMENDED SHIRTS
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
    cache: "no-store",
  })

  const products = await res.json()
  console.log(products)
  console.log("Category:", category)
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container px-4 py-6 md:px-6">
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="sticky top-24">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-lg font-medium">Categories</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        All Clothing
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        T-Shirts
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Shirts
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Jeans
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Dresses
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Jackets
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Shoes
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        Accessories
                      </Link>
                    </li>
                  </ul>
                </div>
                <Separator />
                <div>
                  <h3 className="mb-2 text-lg font-medium">Brands</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input id="brand-nike" type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <label htmlFor="brand-nike" className="ml-2 text-sm text-muted-foreground">
                        Nike
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input id="brand-adidas" type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <label htmlFor="brand-adidas" className="ml-2 text-sm text-muted-foreground">
                        Adidas
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input id="brand-zara" type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <label htmlFor="brand-zara" className="ml-2 text-sm text-muted-foreground">
                        Zara
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input id="brand-hm" type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <label htmlFor="brand-hm" className="ml-2 text-sm text-muted-foreground">
                        H&M
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input id="brand-levis" type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <label htmlFor="brand-levis" className="ml-2 text-sm text-muted-foreground">
                        Levi's
                      </label>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="mb-2 text-lg font-medium">Price Range</h3>
                  <Slider defaultValue={[0, 200]} max={500} step={10} className="py-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">$0</span>
                    <span className="text-sm text-muted-foreground">$500</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="mb-2 text-lg font-medium">Size</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      XS
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      S
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      M
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      L
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      XL
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      XXL
                    </Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="mb-2 text-lg font-medium">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="h-6 w-6 rounded-full bg-black" title="Black"></button>
                    <button className="h-6 w-6 rounded-full bg-white border" title="White"></button>
                    <button className="h-6 w-6 rounded-full bg-red-500" title="Red"></button>
                    <button className="h-6 w-6 rounded-full bg-blue-500" title="Blue"></button>
                    <button className="h-6 w-6 rounded-full bg-green-500" title="Green"></button>
                    <button className="h-6 w-6 rounded-full bg-yellow-500" title="Yellow"></button>
                    <button className="h-6 w-6 rounded-full bg-purple-500" title="Purple"></button>
                    <button className="h-6 w-6 rounded-full bg-pink-500" title="Pink"></button>
                  </div>
                </div>
                <Separator />
                <Button className="w-full">Apply Filters</Button>
              </div>
            </div>
          </aside>
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Women's Clothing</h1>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>Narrow down your product search</SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h3 className="mb-2 text-lg font-medium">Categories</h3>
                        <ul className="space-y-2">
                          <li>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                              All Clothing
                            </Link>
                          </li>
                          <li>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                              T-Shirts
                            </Link>
                          </li>
                          <li>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                              Shirts
                            </Link>
                          </li>
                          <li>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                              Jeans
                            </Link>
                          </li>
                          <li>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                              Dresses
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="mb-2 text-lg font-medium">Price Range</h3>
                        <Slider defaultValue={[0, 200]} max={500} step={10} className="py-4" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">$0</span>
                          <span className="text-sm text-muted-foreground">$500</span>
                        </div>
                      </div>
                      <Button className="w-full">Apply Filters</Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Sort
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Newest</DropdownMenuItem>
                    <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                    <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                    <DropdownMenuItem>Popularity</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-full">
                Dresses
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                T-Shirts
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Jeans
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Tops
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 " >
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" disabled>
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  1
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  2
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  3
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  ...
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  12
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}


