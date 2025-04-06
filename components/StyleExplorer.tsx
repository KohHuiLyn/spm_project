'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Shirt, Sparkles, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import SwipeCard from '@/components/SwipeCard';
import { supabase } from '@/lib/supabase';

interface Product {
  product_id: string;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  category?: string;
  material?: string;
  similarity_score?: number;
}

interface StyleExplorerProps {
  trigger?: React.ReactNode;
}

export default function StyleExplorer({ trigger }: StyleExplorerProps) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [modelStats, setModelStats] = useState<{
    hasPersonalizedModel: boolean;
    interactions: {
      likes: number;
      dislikes: number;
      saves: number;
    };
  }>({
    hasPersonalizedModel: false,
    interactions: {
      likes: 0,
      dislikes: 0,
      saves: 0
    }
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

  // Fetch products and model stats when dialog opens
  useEffect(() => {
    if (open) {
      fetchProducts();
    } else {
      // Reset state when closed
      setCompleted(false);
      setError(null);
    }
  }, [open]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Hardcoded test user ID
      const userId = 'e932f5dc-949c-4341-9237-27126ef03bbb';

      // Fetch products for exploration
      const response = await fetch(`/api/products/recommend/style?limit=20&user_id=${userId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.recommendations && data.recommendations.length > 0) {
        setProducts(data.recommendations);
      } else {
        setError('No products available for exploration');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (product: Product, interaction: 'like' | 'dislike' | 'save') => {
    try {
      // Update in-memory state
      setInteractions(prev => {
        const newState = { ...prev };
        if (interaction === 'like') {
          newState.liked = [...prev.liked, product];
        } else if (interaction === 'dislike') {
          newState.disliked = [...prev.disliked, product];
        } else if (interaction === 'save') {
          newState.saved = [...prev.saved, product];
          newState.liked = [...prev.liked, product]; // Save also counts as a like
        }
        return newState;
      });

      // Update model stats
      setModelStats(prev => ({
        ...prev,
        interactions: {
          likes: interactions.liked.length + (interaction === 'like' || interaction === 'save' ? 1 : 0),
          dislikes: interactions.disliked.length + (interaction === 'dislike' ? 1 : 0),
          saves: interactions.saved.length + (interaction === 'save' ? 1 : 0)
        }
      }));
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const handleCompleted = () => {
    setCompleted(true);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-6">
          <Skeleton className="h-[300px] w-full mb-4" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      );
    }

    if (completed) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <Sparkles className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Exploration Complete!</h3>
          <p className="text-muted-foreground mb-6">
            Your style preferences have been updated based on your interactions.
          </p>
          
          {modelStats && (
            <div className="bg-slate-50 p-4 rounded-md mb-6 w-full max-w-md">
              <h4 className="font-medium mb-2">Your Style Profile</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Liked Items:</div>
                <div className="font-medium">{modelStats.interactions.likes}</div>
                <div>Saved Items:</div>
                <div className="font-medium">{modelStats.interactions.saves}</div>
                <div>Personalized Model:</div>
                <div className="font-medium">
                  {modelStats.hasPersonalizedModel ? (
                    <span className="text-green-600 flex items-center">
                      <Sparkles className="h-3 w-3 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="text-amber-600">Not yet</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button onClick={() => {
              setCompleted(false);
              setInteractions({ liked: [], disliked: [], saved: [] });
              setModelStats({
                hasPersonalizedModel: false,
                interactions: { likes: 0, dislikes: 0, saves: 0 }
              });
              fetchProducts();
            }} variant="outline">
              <RotateCw className="h-4 w-4 mr-2" />
              Explore More
            </Button>
            <Button onClick={() => setOpen(false)}>
              View Recommendations
            </Button>
          </div>
        </div>
      );
    }

    if (products.length > 0) {
      return (
        <div className="h-[600px] max-h-[80vh]">
          <SwipeCard 
            products={products}
            onInteraction={handleInteraction}
            onCompleted={handleCompleted}
            modelInfo={modelStats ? {
              isPersonalized: modelStats.hasPersonalizedModel,
              interactionsCount: modelStats.interactions.likes + modelStats.interactions.saves,
              nextRetrainIn: 0
            } : undefined}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p>No products available for exploration.</p>
        <Button onClick={() => setOpen(false)} className="mt-4">Close</Button>
      </div>
    );
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button 
          onClick={() => setOpen(true)}
          className="flex items-center"
          variant="outline"
        >
          <Shirt className="h-4 w-4 mr-2" />
          Explore Styles
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Explore Styles</DialogTitle>
            <DialogDescription>
              Swipe to like or dislike items and help us personalize your recommendations. 
              Swipe right to like, left to dislike, up to save.
            </DialogDescription>
          </DialogHeader>
          
          {renderContent()}
        </DialogContent>
      </Dialog>
    </>
  );
} 