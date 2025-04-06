'use client';

import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StyleRecommenderProps {
  productId: string;
}

interface Product {
  product_id: string;
  name: string;
  category: string;
  similarity_score: number;
  image_url: string;
  price: number;
}

export default function StyleRecommender({ productId }: StyleRecommenderProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hardcoded user ID
  const USER_ID = 'e932f5dc-949c-4341-9237-27126ef03bbb';

  // Fetch user profile and recommendations
  useEffect(() => {
    const fetchUserAndRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First fetch the user profile using hardcoded user ID
        const profileResponse = await fetch(`/api/profile?user_id=${USER_ID}`);
        
        let profileData = null;
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
          setUserProfile(profileData);
        } else {
          console.warn('Could not fetch user profile, proceeding with user ID only');
        }
        
        // Always try to get recommendations with the user ID
        await fetchRecommendationsWithProfile(profileData || { user_id: USER_ID });
      } catch (error) {
        console.error('Error in StyleRecommender:', error);
        setError('Failed to load style recommendations');
        setLoading(false);
      }
    };
    
    fetchUserAndRecommendations();
  }, [productId]);

  // Fetch recommendations with user profile context
  const fetchRecommendationsWithProfile = async (profile: any) => {
    try {
      // Configure query parameters
      const queryParams = new URLSearchParams({
        product_id: productId,
        limit: '4',
        user_id: USER_ID // Always use hardcoded user ID
      });
      
      const response = await fetch(`/api/products/recommend/style?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get style recommendations');
      }

      const data = await response.json();
      
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      } else {
        setError('No style recommendations available based on your preferences');
      }
    } catch (error) {
      console.error('Error getting style recommendations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load style recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="my-8">
        <CardContent className="text-center py-6">
          <div className="text-red-500">{error}</div>
          <Button 
            onClick={() => fetchRecommendationsWithProfile(userProfile || { user_id: USER_ID })} 
            variant="outline" 
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Complete Your Look</CardTitle>
        <CardDescription>
          {userProfile?.styles ? 
            "Personalized style recommendations based on your preferences" : 
            "Style recommendations based on your selection"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <>
            {userProfile?.styles && (
              <div className="p-3 bg-blue-50 rounded-md border border-blue-100 mb-4">
                <p className="text-sm text-blue-800">
                  Recommendations tailored to your style preferences: {Array.isArray(JSON.parse(userProfile.styles)) ? JSON.parse(userProfile.styles).slice(0, 2).join(", ") : userProfile.styles}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map((product, index) => (
                <Link key={`${product.product_id}-${index}`} href={`/product/${product.product_id}`}>
                  <div className="group cursor-pointer">
                    <div className="relative w-full aspect-square overflow-hidden rounded-md">
                      <Image
                        src={product.image_url || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <h4 className="mt-2 text-sm font-medium truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <p className="text-sm font-semibold mt-1">${product.price?.toFixed(2)}</p>
                    {product.similarity_score > 0.7 && userProfile?.styles && (
                      <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                        Strong match
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            {error || "No style recommendations available"}
          </div>
        )}
        
        {!loading && (
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => fetchRecommendationsWithProfile(userProfile || { user_id: USER_ID })} 
              variant="outline" 
              size="sm"
            >
              Refresh Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
