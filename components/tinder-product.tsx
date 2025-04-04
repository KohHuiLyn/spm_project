"use client"

import { useState, useEffect, useRef } from "react"
import { Heart, X, ArrowUp, CheckCircle, XCircle } from "lucide-react"
import { motion, AnimatePresence, type PanInfo, useAnimation } from "framer-motion"
import { useRouter } from "next/navigation"

type Product = {
  product_id: string
  name: string
  price: number
  image_url: string
  slug: string
}

type NotificationType = {
  message: string
  type: "success" | "error" | null
  visible: boolean
}

export function TinderProduct({ products }: { products: Product[] }) {
  const router = useRouter()
  const controls = useAnimation()
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [direction, setDirection] = useState<string | null>(null)
  const [liked, setLiked] = useState<string[]>([])
  const [disliked, setDisliked] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [notification, setNotification] = useState<NotificationType>({
    message: "",
    type: null,
    visible: false,
  })
  const constraintsRef = useRef(null)

  // Get a random product that hasn't been liked or disliked
  useEffect(() => {
    if (products.length > 0) {
      const availableProducts = products.filter(
        (product) => !liked.includes(product.product_id) && !disliked.includes(product.product_id),
      )

      if (availableProducts.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableProducts.length)
        const productIndex = products.findIndex((p) => p.product_id === availableProducts[randomIndex].product_id)
        setCurrentProductIndex(productIndex)
      }
    }
  }, [products, liked, disliked])

  const currentProduct = products[currentProductIndex]

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({
      message,
      type,
      visible: true,
    })

    // Hide notification after 2 seconds
    setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        visible: false,
      }))
    }, 2000)
  }

  const handleSwipe = (direction: string) => {
    if (!currentProduct) return

    setDirection(direction)

    if (direction === "right") {
      setLiked([...liked, currentProduct.product_id])
      showNotification("Liked", "success")
    } else if (direction === "left") {
      setDisliked([...disliked, currentProduct.product_id])
      showNotification("Disliked", "error")
    } else if (direction === "up") {
      // Navigate to product page after animation
      setTimeout(() => {
        router.push(`/product/${currentProduct.product_id}`)
      }, 100)
    }

    // Reset direction after animation completes
    setTimeout(() => {
      setDirection(null)
    }, 500)
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    const threshold = 100
    const velocity = 0.5

    // Determine swipe direction based on drag distance and velocity
    if (info.offset.x > threshold && info.velocity.x > velocity) {
      // Swipe right (like)
      controls
        .start({
          x: 500,
          opacity: 0,
          rotate: 30,
          transition: { duration: 0.3 },
        })
        .then(() => handleSwipe("right"))
    } else if (info.offset.x < -threshold && info.velocity.x < -velocity) {
      // Swipe left (dislike)
      controls
        .start({
          x: -500,
          opacity: 0,
          rotate: -30,
          transition: { duration: 0.3 },
        })
        .then(() => handleSwipe("left"))
    } else if (info.offset.y < -threshold && info.velocity.y < -velocity) {
      // Swipe up (view)
      controls
        .start({
          y: -500,
          opacity: 0,
          transition: { duration: 0.3 },
        })
        .then(() => handleSwipe("up"))
    } else {
      // Return to center if not swiped far enough
      controls.start({
        x: 0,
        y: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      })
    }
  }

  if (!currentProduct) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50  rounded-lg">
        <p className="text-xl font-medium text-gray-500">No more products to discover</p>
        <button
          onClick={() => {
            setLiked([])
            setDisliked([])
          }}
          className="mt-4 px-4 py-2 bg-black text-white rounded-md"
        >
          Reset
        </button>
      </div>
    )
  }

  return (
    <div className="relative h-[450px] w-full rounded-lg overflow-hidden" ref={constraintsRef}>


      <AnimatePresence>
        {direction === null && (
          <motion.div
            key={currentProduct.product_id}
            className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
            initial={{ opacity: 100 }}
            animate={controls}
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.7}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.05 }}
            style={{
              x: 0,
              y: 0,
              rotate: 0,
            }}
          >
            <div className="relative h-full w-full">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-6 text-white z-10 pointer-events-none">
                <h3 className="text-xl font-bold">{currentProduct.name}</h3>
                <p className="text-lg font-semibold">${currentProduct.price.toFixed(2)}</p>
              </div>

              <div
                className="absolute inset-0 bg-center bg-no-repeat bg-contain"
                style={{
                  backgroundImage: `url(${currentProduct.image_url || "/placeholder.svg?height=500&width=400"})`,
                  pointerEvents: "none", // This ensures drag events pass through
                }}
                aria-label={currentProduct.name}
              />

              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    className="bg-green-500/80 text-white font-bold text-2xl px-6 py-2 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: controls.x > 50 ? 1 : 0,
                      scale: controls.x > 50 ? 1 : 0.8,
                      rotate: 0,
                    }}
                  >
                    LIKE
                  </motion.div>

                  <motion.div
                    className="bg-red-500/80 text-white font-bold text-2xl px-6 py-2 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: controls.x < -50 ? 1 : 0,
                      scale: controls.x < -50 ? 1 : 0.8,
                      rotate: 0,
                    }}
                  >
                    NOPE
                  </motion.div>

                  <motion.div
                    className="bg-blue-500/80 text-white font-bold text-2xl px-6 py-2 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: controls.y < -50 ? 1 : 0,
                      scale: controls.y < -50 ? 1 : 0.8,
                      rotate: 0,
                    }}
                  >
                    VIEW
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification popup */}
      <AnimatePresence>
        {notification.visible && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
                notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {notification.type === "success" ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              <span className="font-medium text-lg">{notification.message}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-8 z-20">
        <button
          onClick={() => {
            controls
              .start({
                x: -300,
                opacity: 0,
                rotate: -30,
                transition: { duration: 0.3 },
              })
              .then(() => handleSwipe("left"))
          }}
          className="flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-lg"
          aria-label="Dislike"
        >
          <X className="w-8 h-8 text-red-500" />
        </button>

        <button
          onClick={() => {
            controls
              .start({
                y: -300,
                opacity: 0,
                transition: { duration: 0.3 },
              })
              .then(() => handleSwipe("up"))
          }}
          className="flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-lg"
          aria-label="View product"
        >
          <ArrowUp className="w-8 h-8 text-blue-500" />
        </button>

        <button
          onClick={() => {
            controls
              .start({
                x: 300,
                opacity: 0,
                rotate: 30,
                transition: { duration: 0.3 },
              })
              .then(() => handleSwipe("right"))
          }}
          className="flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-lg"
          aria-label="Like"
        >
          <Heart className="w-8 h-8 text-green-500" />
        </button>
      </div>
    </div>
  )
}

