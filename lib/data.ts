export interface Product {
    id: number
    name: string
    brand: string
    price: number
    originalPrice?: number
    discount?: number
    image: string
    images: string[]
    colors: string[]
    sizes: string[]
    description: string
    features: string[]
    rating: number
    reviewCount: number
  }
  
  export const categories = [
    { name: "Women's Fashion", href: "/products", image: "/images/categories/women.jpg" },
    { name: "Men's Fashion", href: "/products", image: "/images/categories/mens.webp" },
    { name: "Kids", href: "/products", image: "/images/categories/kids.jpeg" },
    { name: "Outerwear", href: "/products", image: "/images/categories/jacket.webp" },
    { name: "Sports", href: "/products", image: "/images/categories/sports.jpg" },
    { name: "Sleeveless", href: "/products", image: "/images/categories/tank.jpg" },
  ]

  
  export const products: Product[] = [
    {
      id: 1,
      name: "Slim Fit Cotton T-Shirt",
      brand: "Nike",
      price: 29.99,
      originalPrice: 39.99,
      discount: 25,
      image: "/images/products/product_1.webp",
      images: [
        "/images/products/product_1.webp",
        "/images/products/product_1.webp",
        "/images/products/product_1.webp"
      ],
      colors: ["Red", "Black", "White"],
      sizes: ["S", "M", "L", "XL"],
      description: "Soft, breathable slim-fit t-shirt perfect for daily wear.",
      features: ["100% cotton", "Crew neck", "Short sleeves", "Slim fit"],
      rating: 4.5,
      reviewCount: 128
    },
    {
      id: 2,
      name: "Floral Print Summer Dress",
      brand: "Zara",
      price: 49.99,
      originalPrice: 69.99,
      discount: 28,
      image: "/images/products/product_1.webp",
      images: ["/images/products/product_1.webp"],
      colors: ["Floral"],
      sizes: ["S", "M", "L"],
      description: "Breezy floral summer dress with elegant flow and comfort.",
      features: ["Floral print", "Lightweight", "Mid-length", "Short sleeves"],
      rating: 4.3,
      reviewCount: 96
    },
    {
      id: 3,
      name: "Leather Crossbody Bag",
      brand: "Michael Kors",
      price: 129.99,
      image: "/images/products/product_1.webp",
      images: ["/images/products/product_1.webp"],
      colors: ["Brown", "Black"],
      sizes: [],
      description: "Elegant and compact crossbody bag made from genuine leather.",
      features: ["Adjustable strap", "Zipper closure", "Gold hardware"],
      rating: 4.8,
      reviewCount: 215
    },
    {
      id: 4,
      name: "Slim Fit Jeans",
      brand: "Levi's",
      price: 59.99,
      originalPrice: 79.99,
      discount: 25,
      image: "/images/products/product_1.webp",
      images: ["/images/products/product_1.webp"],
      colors: ["Denim Blue", "Black"],
      sizes: ["30", "32", "34", "36"],
      description: "Classic Levi's slim-fit jeans with stretchable comfort.",
      features: ["Slim fit", "5-pocket styling", "Durable denim"],
      rating: 4.6,
      reviewCount: 184
    },
    {
      id: 5,
      name: "Running Shoes",
      brand: "Adidas",
      price: 89.99,
      originalPrice: 119.99,
      discount: 25,
      image: "/images/products/product_1.webp",
      images: ["/images/products/product_1.webp"],
      colors: ["White", "Gray", "Blue"],
      sizes: ["7", "8", "9", "10", "11"],
      description: "Responsive cushioning and breathable design for runners.",
      features: ["Mesh upper", "Rubber outsole", "Lightweight"],
      rating: 4.4,
      reviewCount: 151
    },
    {
      id: 6,
      name: "Wireless Headphones",
      brand: "Sony",
      price: 149.99,
      image: "/images/products/product_1.webp",
      images: ["/images/products/product_1.webp"],
      colors: ["Black", "Silver"],
      sizes: [],
      description: "Noise-cancelling wireless headphones with long battery life.",
      features: ["Bluetooth", "Active Noise Cancelling", "30-hour battery"],
      rating: 4.7,
      reviewCount: 321
    },
    {
      id: 7,
      name: "Oversized Hoodie",
      brand: "H&M",
      price: 39.99,
      originalPrice: 49.99,
      discount: 20,
      image: "/images/products/product_1.webp",
      images: ["/images/products/product_1.webp"],
      colors: ["Gray", "Black", "Beige"],
      sizes: ["S", "M", "L", "XL"],
      description: "Comfy oversized hoodie for a relaxed streetwear vibe.",
      features: ["Oversized fit", "Fleece lining", "Kangaroo pocket"],
      rating: 4.2,
      reviewCount: 78
    },
    {
      id: 8,
      name: "Smartwatch",
      brand: "Apple",
      price: 299.99,
      image: "/images/products/product_1.webp",
      images: ["/images/products/product_1.webp"],
      colors: ["Silver", "Space Gray"],
      sizes: [],
      description: "Advanced smartwatch with fitness tracking and health tools.",
      features: ["Heart rate monitor", "Water resistant", "GPS"],
      rating: 4.9,
      reviewCount: 402
    },
    {
      id: 9,
      name: "Leather Wallet",
      brand: "Fossil",
      price: 45.99,
      originalPrice: 59.99,
      discount: 23,
      image: "/images/products/product_1.webp",
      images: ["/images/products/product_1.webp"],
      colors: ["Dark Brown", "Tan"],
      sizes: [],
      description: "Slim bi-fold wallet crafted with genuine leather.",
      features: ["6 card slots", "RFID protection", "Compact design"],
      rating: 4.5,
      reviewCount: 110
    },
    {
      id: 10,
      name: "Sunglasses",
      brand: "Ray-Ban",
      price: 129.99,
      image: "/images/products/product_1.webp",
      images: ["/images/products/product_1.webp"],
      colors: ["Black", "Tortoise"],
      sizes: [],
      description: "Iconic Ray-Ban design for stylish sun protection.",
      features: ["UV protection", "Polarized lenses", "Unisex"],
      rating: 4.6,
      reviewCount: 190
    }
  ]
  
  export const brands = [
    { name: "Nike", logo: "/images/brands/nike.jpg" },
    { name: "Adidas", logo: "/images/brands/adidas.png" },
    { name: "Zara", logo: "/images/brands/zara.jpg" },
    { name: "H&M", logo: "/images/brands/hm.webp" },
    { name: "Levi's", logo: "/images/brands/levis.jpg" },
    { name: "Puma", logo: "/images/brands/puma.png" },
  ]
  
  export const recommendedProducts = [
    {
      id: 1,
      name: "Classic Crew Neck T-Shirt",
      brand: "Adidas",
      price: 24.99,
      discount: 20,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 2,
      name: "Graphic Print T-Shirt",
      brand: "Puma",
      price: 29.99,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 3,
      name: "V-Neck Cotton T-Shirt",
      brand: "H&M",
      price: 19.99,
      discount: 15,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 4,
      name: "Long Sleeve T-Shirt",
      brand: "Nike",
      price: 34.99,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 5,
      name: "Striped Cotton T-Shirt",
      brand: "Zara",
      price: 27.99,
      discount: 30,
      image: "/placeholder.svg?height=300&width=300",
    },
  ]
  