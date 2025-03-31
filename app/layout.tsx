import type React from "react"
import { EnvVarWarning } from "@/components/env-var-warning"
import HeaderAuth from "@/components/header-auth"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { hasEnvVars } from "@/utils/supabase/check-env-vars"
import { Geist } from "next/font/google"
import { ThemeProvider } from "next-themes"
import Link from "next/link"
import { Search, Heart, ShoppingBag } from "lucide-react"
import "./globals.css"
import CartIcon from "@/components/cart-count"
import { createClient } from "@/utils/supabase/server"
const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "New Arrivals Zalora Singapore",
  description: "Shop the latest fashion trends at Zalora",
}

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
    const supabase = await createClient();
  
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <main className="min-h-screen flex flex-col">
            {/* Top promotional banner */}
            <div className="w-full bg-[#f5f5f5] text-xs py-2 flex justify-center items-center space-x-4 overflow-x-auto whitespace-nowrap px-4">
              <div className="flex items-center">
                <span>30 Days Free Returns | T&C Apply</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1 h-3 w-3"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="flex items-center">
                <span className="bg-[#7b1fa2] text-white px-1">VIP</span>
                <span className="ml-1">Become a ZALORA VIP today!</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1 h-3 w-3"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="flex items-center">
                <span>Extra 10% Off + Free Shipping on Your First App Purchase</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1 h-3 w-3"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>

            {/* Main header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white">
              <div className="container mx-auto px-4 py-4">
                {/* Logo and search row */}
                <div className="flex items-center justify-between mb-4">
                <Link href="/">
                  <img
                    src="/images/logo.png"
                    alt="Zalora Logo"
                    className="h-6 my-auto mx-auto"
                  />
                </Link>

                  <div className="flex-grow mx-8 max-w-xl">
                    <div className="relative">
                      <input
                        type="search"
                        placeholder="Levi's: Up to 40% Off"
                        className="w-full rounded-full border border-gray-300 pl-4 pr-10 py-2 text-sm"
                        style={{backgroundColor:'transparent'}}
                      />
                      <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Search className="h-6 w-6" color="white" style={{backgroundColor:'black', padding:3, borderRadius:'1000px'}} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {user?.id && <Heart className="h-5 w-5" />}

                    {user?.id && <CartIcon userId={user.id} />}

                    <HeaderAuth/>
                  </div>
                </div>

                {/* Navigation categories */}
                <nav className="flex items-center justify-center space-x-8 text-sm font-medium">
                  <Link href="/products?category=women" className="hover:font-bold">WOMEN</Link>
                  <Link href="/products?category=men" className="hover:font-bold">MEN</Link>
                  <Link href="/products?category=luxury" className="hover:font-bold">LUXURY</Link>
                  <Link href="/products?category=sports" className="hover:font-bold">SPORTS</Link>
                  <Link href="/products?category=beauty" className="hover:font-bold">BEAUTY</Link>
                  <Link href="/products?category=kids" className="hover:font-bold">KIDS</Link>
                  <Link href="/products?category=lifestyle" className="hover:font-bold">LIFESTYLE</Link>
                </nav>

              </div>
            </header>

            <div className="flex-1">{children}</div>

            <footer className="border-t bg-white">
              <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Shop</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <Link href="#" className="text-gray-500 hover:text-black">
                          Women
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="text-gray-500 hover:text-black">
                          Men
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="text-gray-500 hover:text-black">
                          Kids
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="text-gray-500 hover:text-black">
                          Beauty
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Help</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <Link href="#" className="text-gray-500 hover:text-black">
                          Customer Service
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="text-gray-500 hover:text-black">
                          Track Order
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="text-gray-500 hover:text-black">
                          Returns & Refunds
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-4 text-lg font-medium">About</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <Link href="#" className="text-gray-500 hover:text-black">
                          About Us
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="text-gray-500 hover:text-black">
                          Careers
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Contact</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <span className="text-gray-500">Email: </span>
                        <Link href="mailto:support@zalora.com" className="hover:underline">
                          support@zalora.com
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-12 border-t pt-8 text-center text-sm text-gray-500">
                  <p className="mb-2">© 2023 ZALORA. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}

