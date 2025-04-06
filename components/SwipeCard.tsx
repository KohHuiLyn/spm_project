'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, X, ArrowUp, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  product_id: string;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  tag?: string;
  material?: string;
  colour?: string;
  similarity_score?: number;
  id: string;
}

interface SwipeCardProps {
  products: Product[];
  onInteraction: (product: Product, interaction: 'like' | 'dislike' | 'save') => void;
  onCompleted: () => void;
  modelInfo?: {
    isPersonalized: boolean;
    interactionsCount: number;
    nextRetrainIn: number;
  }
}

export default function SwipeCard({ products, onInteraction, onCompleted, modelInfo }: SwipeCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);

  // Get current product
  const currentProduct = products[currentIndex];
  
  // For swipe mechanics
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const rotateZ = useTransform(dragX, [-200, 200], [-10, 10]);
  
  // Transform for visual feedback
  const opacity = useTransform(
    dragX,
    [-200, -100, 0, 100, 200],
    [1, 0.5, 0, 0.5, 1]
  );
  
  const likeOpacity = useTransform(
    dragX,
    [-100, 0, 100, 200],
    [0, 0, 0.5, 1]
  );
  
  const dislikeOpacity = useTransform(
    dragX,
    [-200, -100, 0, 100],
    [1, 0.5, 0, 0]
  );
  
  const saveOpacity = useTransform(
    dragY,
    [0, -100],
    [0, 1]
  );

  // Add this effect to reset position when index changes
  useEffect(() => {
    // Reset drag values when moving to a new card
    dragX.set(0);
    dragY.set(0);
  }, [currentIndex, dragX, dragY]);

  // Add this useEffect to animate the card properly when it appears
  useEffect(() => {
    // When a new card appears, make sure it starts correctly positioned
    if (currentProduct) {
      dragX.set(0);
      dragY.set(0);
    }
  }, [currentProduct, dragX, dragY]);

  // Handle drag end
  const handleDragEnd = (event: any, info: any) => {
    const dragDistance = info.offset;
    
    if (dragDistance.x > 100) {
      setExitDirection('right');
      handleSwipe('like');
    } else if (dragDistance.x < -100) {
      setExitDirection('left');
      handleSwipe('dislike');
    } else if (dragDistance.y < -100) {
      setExitDirection('up');
      handleSwipe('save');
    } else {
      // Reset to center if not swiped enough
      dragX.set(0);
      dragY.set(0);
    }
  };

  // Handle swipe action
  const handleSwipe = (action: 'like' | 'dislike' | 'save') => {
    if (currentProduct) {
      // Make sure we have the proper product_id, falling back to id if needed
      const product = {
        ...currentProduct,
        product_id: currentProduct.product_id || currentProduct.id
      };
      
      onInteraction(product, action);
      setInteractionCount(interactionCount + 1);
      
      // Move to next card
      setTimeout(() => {
        setExitDirection(null);
        if (currentIndex < products.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          onCompleted();
        }
      }, 300);
    }
  };

  // Handle button clicks
  const handleLike = () => {
    setExitDirection('right');
    handleSwipe('like');
  };

  const handleDislike = () => {
    setExitDirection('left');
    handleSwipe('dislike');
  };

  const handleSave = () => {
    setExitDirection('up');
    handleSwipe('save');
  };

  if (!currentProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <p className="text-lg mb-4">No more products to swipe!</p>
        <Button onClick={() => onCompleted()}>Finish</Button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Progress indicator */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} of {products.length}
        </div>
        {modelInfo && (
          <div className="flex items-center">
            <Badge variant={modelInfo.isPersonalized ? "success" : "outline"} className="mr-2">
              {modelInfo.isPersonalized ? (
                <><Sparkles className="h-3 w-3 mr-1" /> Personalized</>
              ) : "Base Model"}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {modelInfo.nextRetrainIn > 0 && `${modelInfo.nextRetrainIn} more to retrain`}
            </div>
          </div>
        )}
      </div>

      {/* Swipe instructions */}
      <div className="text-xs text-center text-muted-foreground mb-2 flex justify-center items-center gap-3">
        <span className="flex items-center"><X size={12} className="mr-1" /> Dislike</span>
        <span className="flex items-center"><Heart size={12} className="mr-1" /> Like</span>
        <span className="flex items-center"><ArrowUp size={12} className="mr-1" /> Save</span>
      </div>

      {/* Swipeable card */}
      <div className="relative w-full flex-1 mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProduct.product_id || currentIndex}
            className="absolute w-full h-full"
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            style={{ 
              x: dragX, 
              y: dragY,
              rotateZ,
              zIndex: products.length - currentIndex
            }}
            initial={{ scale: 0.95, opacity: 0, x: 0, y: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              x: 0, 
              y: 0,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            exit={{
              x: exitDirection === 'left' ? -300 : exitDirection === 'right' ? 300 : 0,
              y: exitDirection === 'up' ? -300 : 0,
              opacity: 0,
              transition: { duration: 0.3 }
            }}
          >
            <Card className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
              <div className="relative w-full aspect-square">
                <Image
                  src={currentProduct.image_url || '/placeholder.svg'}
                  alt={currentProduct.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                
                {/* Interaction indicators */}
                <motion.div 
                  className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2" 
                  style={{ opacity: likeOpacity }}
                >
                  <Heart className="h-8 w-8" />
                </motion.div>
                
                <motion.div 
                  className="absolute top-4 left-4 bg-red-500 text-white rounded-full p-2" 
                  style={{ opacity: dislikeOpacity }}
                >
                  <X className="h-8 w-8" />
                </motion.div>
                
                <motion.div 
                  className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white rounded-full p-2" 
                  style={{ opacity: saveOpacity }}
                >
                  <ArrowUp className="h-8 w-8" />
                </motion.div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{currentProduct.name}</h3>
                    <p className="text-muted-foreground">${currentProduct.price.toFixed(2)}</p>
                  </div>
                  {currentProduct.similarity_score !== undefined && (
                    <Badge variant={currentProduct.similarity_score > 0.7 ? "default" : "outline"}>
                      {Math.round(currentProduct.similarity_score * 100)}% match
                    </Badge>
                  )}
                </div>
                {currentProduct.tag && (
                  <Badge variant="outline" className="mt-2">{currentProduct.tag}</Badge>
                )}
                {currentProduct.material && (
                  <p className="text-sm text-muted-foreground mt-2">{currentProduct.material}</p>
                )}
                {currentProduct.colour && (
                  <p className="text-sm text-muted-foreground mt-2">{currentProduct.colour}</p>
                )}
                {currentProduct.description && (
                  <p className="text-sm mt-2 line-clamp-2">{currentProduct.description}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Buttons for manual interaction */}
      <div className="flex justify-center gap-4 mt-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-14 w-14 rounded-full border-red-200 bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600"
          onClick={handleDislike}
        >
          <X className="h-6 w-6" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="h-14 w-14 rounded-full border-blue-200 bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600"
          onClick={handleSave}
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="h-14 w-14 rounded-full border-green-200 bg-green-100 text-green-500 hover:bg-green-200 hover:text-green-600"
          onClick={handleLike}
        >
          <Heart className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
} 