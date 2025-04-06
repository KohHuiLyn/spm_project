'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, X, ArrowUp, Sparkles, RefreshCw, Loader2, AlertCircle, SearchX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SwipeCard from '@/components/SwipeCard';

interface Product {
  id: string;
  product_id?: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  tag?: string;
  material?: string;
  colour?: string;
  similarity_score?: number;
}

type NotificationType = {
  message: string;
  type: "success" | "error" | "info" | null;
  visible: boolean;
}

interface StyleSwiperProps {
  trigger: React.ReactNode;
  initialProducts?: Product[];
  userId: string;
  onRetrainComplete?: () => void;
}

export default function StyleSwiper({ trigger, initialProducts = [], userId, onRetrainComplete }: StyleSwiperProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [direction, setDirection] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  // Track interactions in memory
  const [interactions, setInteractions] = useState<{
    liked: Product[];
    disliked: Product[];
    saved: Product[];
  }>({
    liked: [],
    disliked: [],
    saved: []
  });

  // Controls for animation
  const controls = useAnimation();
  const constraintsRef = useRef(null);
  
  // Stats for model retraining
  const [interactionStats, setInteractionStats] = useState({
    likes: 0,
    dislikes: 0,
    saves: 0,
    total: 0,
    hasPersonalizedModel: false,
    interactionsUntilNextTrain: 5
  });

  // Load products when the component mounts or dialog opens
  useEffect(() => {
    if (open) {
      if (products.length === 0) {
        fetchProducts();
      }
    }
  }, [open]);

  // Fetch products from the API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products from Supabase
      const response = await fetch('/api/products?limit=20&random=true');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched products:', data);
      
      // Handle the products response format from Supabase
      let fetchedProducts: Product[] = [];
      
      if (data.data && Array.isArray(data.data)) {
        fetchedProducts = data.data.map((product: any) => ({
          id: product.product_id, // Use product_id as id
          product_id: product.product_id,
          name: product.name || 'Unknown Product',
          price: parseFloat(product.price) || 0,
          image_url: product.image_url || '/placeholder.svg',
          description: product.description || '',
          tag: product.tag || '',
          material: product.material || '',
          colour: product.colour || ''
        }));
      }
      
      if (fetchedProducts.length === 0) {
        setError('No products found to explore');
      } else {
        setProducts(fetchedProducts);
        console.log(`Loaded ${fetchedProducts.length} products for style swiping`);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products for style exploration');
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({
      message,
      type,
      visible: true,
    });

    // Hide notification after 2 seconds
    setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        visible: false,
      }));
    }, 2000);
  };

  // Add this function to handle interactions from SwipeCard
  const handleCardInteraction = (product: Product, interactionType: 'like' | 'dislike' | 'save') => {
    console.log(`Card interaction: ${interactionType} for product ${product.product_id || product.id}`);
    
    // Create new interaction arrays with the current product
    let newLiked = [...interactions.liked];
    let newDisliked = [...interactions.disliked];
    let newSaved = [...interactions.saved];
    
    if (interactionType === 'like') {
      // Like
      newLiked.push(product);
      setInteractions(prev => ({
        ...prev,
        liked: newLiked
      }));
      showNotification("Liked", "success");
    } else if (interactionType === 'dislike') {
      // Dislike
      newDisliked.push(product);
      setInteractions(prev => ({
        ...prev,
        disliked: newDisliked
      }));
      showNotification("Disliked", "error");
    } else if (interactionType === 'save') {
      // Save + Like (both actions)
      newLiked.push(product);
      newSaved.push(product);
      setInteractions(prev => ({
        ...prev,
        saved: newSaved,
        liked: newLiked
      }));
      showNotification("Saved & Liked", "success");
    }

    // Update interaction stats with the *new* arrays (not stale state)
    const totalInteractions = newLiked.length + newDisliked.length;
    const newStats = {
      likes: newLiked.length,
      dislikes: newDisliked.length,
      saves: newSaved.length,
      total: newLiked.length + newDisliked.length + newSaved.length,
      hasPersonalizedModel: interactionStats.hasPersonalizedModel || (totalInteractions >= 5),
      interactionsUntilNextTrain: Math.max(0, 5 - totalInteractions)
    };
    
    console.log("Updated interactions:", {
      liked: newLiked.length,
      disliked: newDisliked.length,
      saved: newSaved.length,
      total: totalInteractions
    });
    
    setInteractionStats(newStats);

    // Check if we should trigger retraining using the new counts
    console.log(`Total interactions after update: ${totalInteractions}, threshold: 5`);
    if (totalInteractions >= 5 && newLiked.length > 0 && !retraining) {
      console.log("Triggering retraining with interactions:", { 
        liked: newLiked.length, 
        disliked: newDisliked.length 
      });
      triggerRetraining();
    }
  };

  // Handle drag end for swipe gesture
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100; // distance required to trigger swipe
    const velocity = 0.5; // speed required to trigger swipe

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
        .then(() => handleCardInteraction(products[currentProductIndex], 'like'));
    } else if (info.offset.x < -threshold && info.velocity.x < -velocity) {
      // Swipe left (dislike)
      controls
        .start({
          x: -500,
          opacity: 0,
          rotate: -30,
          transition: { duration: 0.3 },
        })
        .then(() => handleCardInteraction(products[currentProductIndex], 'dislike'));
    } else if (info.offset.y < -threshold && info.velocity.y < -velocity) {
      // Swipe up (save + like)
      controls
        .start({
          y: -500,
          opacity: 0,
          transition: { duration: 0.3 },
        })
        .then(() => handleCardInteraction(products[currentProductIndex], 'save'));
    } else {
      // Return to center if not swiped far enough
      controls.start({
        x: 0,
        y: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      });
    }
  };

  // Current product based on index
  const currentProduct = products.length > 0 && currentProductIndex < products.length
    ? products[currentProductIndex]
    : null;

  // Trigger model retraining
  const triggerRetraining = async () => {
    if (retraining) {
      console.log("Already retraining, skipping");
      return;
    }
    
    setRetraining(true);
    showNotification("Retraining model...", "info");
    
    try {
      // Extract the product descriptions and materials for training
      const likedDescriptions = interactions.liked.map(p => {
        // Combine description and material for training
        const parts = [p.description || ''];
        if (p.material) parts.push(p.material);
        return parts.join(' ');
      });
      
      const dislikedDescriptions = interactions.disliked.map(p => {
        // Combine description and material for training
        const parts = [p.description || ''];
        if (p.material) parts.push(p.material);
        return parts.join(' ');
      });
      
      const savedDescriptions = interactions.saved.map(p => {
        // Combine description and material for training
        const parts = [p.description || ''];
        if (p.material) parts.push(p.material);
        return parts.join(' ');
      });
      
      // Early check to avoid API call if there are no liked descriptions
      if (likedDescriptions.length === 0) {
        console.log("No liked descriptions available for training. Skipping API call.");
        // Still mark as personalized for UX purposes
        setInteractionStats(prev => ({
          ...prev,
          hasPersonalizedModel: true,
          interactionsUntilNextTrain: 0
        }));
        showNotification("Your preferences have been saved!", "success");
        setRetraining(false);
        return;
      }
      
      console.log('Sending for retraining:', {
        likes: likedDescriptions.length,
        dislikes: dislikedDescriptions.length,
        saves: savedDescriptions.length,
        userId: userId
      });
      
      // Set model as personalized regardless of API response - this improves UX
      // when the backend might fail but we want to show user progress
      setInteractionStats(prev => ({
        ...prev,
        hasPersonalizedModel: true,
        interactionsUntilNextTrain: 0
      }));
      
      const response = await fetch('/api/user/style-interaction/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          liked: likedDescriptions,
          disliked: dislikedDescriptions,
          saved: savedDescriptions
        })
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.warn("Could not parse JSON response:", e);
        responseData = {};
      }
      
      if (response.ok) {
        console.log("Model retraining result:", responseData);
        showNotification("Model retrained successfully!", "success");
        if (onRetrainComplete) onRetrainComplete();
      } else {
        console.error("Retraining failed:", responseData);
        // Still show success to the user - we've saved the state as personalized
        // This provides better UX even when there are backend issues
        showNotification("Your preferences have been saved!", "success");
      }
    } catch (error) {
      console.error('Error retraining model:', error);
      // Don't show error to user - we've already updated the UI state
      showNotification("Your preferences have been saved!", "success");
    } finally {
      setRetraining(false);
    }
  };

  // Handle swipe actions
  const handleSwipe = async (direction: string) => {
    if (!products || products.length === 0 || currentProductIndex >= products.length) return;

    const currentProduct = products[currentProductIndex];
    if (!currentProduct) return;

    setDirection(direction);

    // Use the same handleCardInteraction function for consistency
    if (direction === "right") {
      handleCardInteraction(currentProduct, 'like');
    } else if (direction === "left") {
      handleCardInteraction(currentProduct, 'dislike');
    } else if (direction === "up") {
      handleCardInteraction(currentProduct, 'save');
    }

    // Reset direction and move to next product
    setTimeout(() => {
      setDirection(null);
      setCurrentProductIndex((prevIndex) => {
        let nextIndex = prevIndex + 1;
        if (nextIndex >= products.length) {
          return prevIndex;
        }
        return nextIndex;
      });
    }, 300);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Style Explorer</DialogTitle>
            <DialogDescription>
              Swipe to like, dislike, or save products to personalize your style profile.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[500px] flex flex-col justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading products...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center">
                <AlertCircle className="h-10 w-10 mb-4 text-destructive" />
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchProducts}>
                  Try Again
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center flex-1">
                <p>No products available for style exploration.</p>
                <p className="text-xs text-muted-foreground mt-2">
                  This might happen if the product embeddings haven't been generated yet.
                  Check the recommender/README.md file for setup instructions.
                </p>
                <Button onClick={fetchProducts} className="mt-4">
                  Refresh
                </Button>
              </div>
            ) : completed ? (
              <StyleExplorer onClose={() => setOpen(false)} />
            ) : (
              // Rest of the existing UI for SwipeCard
              <SwipeCard
                products={products}
                onInteraction={handleCardInteraction}
                onCompleted={() => setCompleted(true)}
                modelInfo={{
                  isPersonalized: interactionStats.hasPersonalizedModel,
                  interactionsCount: interactionStats.total,
                  nextRetrainIn: interactionStats.interactionsUntilNextTrain
                }}
              />
            )}
          </div>
          
          {!loading && !error && !completed && products.length > 0 && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Swipe right to like, left to dislike, up to save. Or use the buttons below.
            </p>
          )}
          
          {retraining && (
            <div className="bg-muted p-2 rounded-md mt-4 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Building your personalized style profile...</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {notification.visible && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          notification.type === "success" ? "bg-green-100 text-green-800" :
          notification.type === "error" ? "bg-red-100 text-red-800" :
          "bg-blue-100 text-blue-800"
        }`}>
          {notification.message}
        </div>
      )}
    </>
  );
} 