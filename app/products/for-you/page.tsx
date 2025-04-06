'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import StyleExplorer from '@/components/StyleExplorer';
import StyleSwiper from '@/components/StyleSwiper';

interface Product {
  id: string;
  product_id?: string;
  name: string;
  price: number;
  image_url: string;
  category?: string;
  description?: string;
  material?: string;
  similarity_score?: number;
}

export default function ForYouPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isPersonalizedModel, setIsPersonalizedModel] = useState(false);
  const [stylePreferences, setStylePreferences] = useState<string[]>([]);
  
  // Hardcoded user ID
  const USER_ID = 'e932f5dc-949c-4341-9237-27126ef03bbb';

  // Helper function to safely parse style preferences
  const parseStylePreferences = (profile: any) => {
    if (!profile) return [];
    
    try {
      if (profile.styles) {
        // Try to parse as JSON array
        if (typeof profile.styles === 'string') {
          try {
            const parsed = JSON.parse(profile.styles);
            if (Array.isArray(parsed)) {
              return parsed;
            }
            return [profile.styles]; // Return as single item array if not array
          } catch (e) {
            return [profile.styles]; // Return as single item array if parse fails
          }
        }
        
        // If it's already an array
        if (Array.isArray(profile.styles)) {
          return profile.styles;
        }
      }
      
      // Check style_preferences as fallback
      if (profile.style_preferences) {
        if (Array.isArray(profile.style_preferences)) {
          return profile.style_preferences;
        }
        
        if (typeof profile.style_preferences === 'string') {
          try {
            const parsed = JSON.parse(profile.style_preferences);
            if (Array.isArray(parsed)) {
              return parsed;
            }
            return [profile.style_preferences];
          } catch (e) {
            return [profile.style_preferences];
          }
        }
      }
      
      // Final fallback - style as string
      if (profile.style && typeof profile.style === 'string') {
        return [profile.style];
      }
      
      return [];
    } catch (e) {
      console.error('Error parsing style preferences:', e);
      return [];
    }
  };

  // Fetch recommendations function
  const fetchRecommendations = async () => {
    try {
      const queryParams = new URLSearchParams({
        user_id: USER_ID,
        limit: '20'
      });
      
      // First check if user has a model via the stats endpoint
      const statsResponse = await fetch(`/api/user/style-interaction/stats?user_id=${USER_ID}`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        const hasModel = stats.stats?.has_personalized_model || false;
        setIsPersonalizedModel(hasModel);
        console.log(`User ${hasModel ? 'has' : 'does not have'} a personalized model`);
        
        // If no model exists but we have style preferences, trigger model creation
        if (!hasModel && stylePreferences.length > 0) {
          console.log('No model exists but user has style preferences, triggering model creation...');
          const trainResponse = await fetch(`/api/user/style-interaction/train`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: USER_ID,
              liked: stylePreferences,
              disliked: [],
              saved: []
            })
          });
          
          if (trainResponse.ok) {
            console.log('Model creation triggered successfully');
            // Update model status
            setIsPersonalizedModel(true);
          }
        }
      }
      
      // Fetch recommendations - the API will check if the model exists and use it
      const recResponse = await fetch(`/api/products/recommend/style?${queryParams.toString()}`);
      if (recResponse.ok) {
        const responseData = await recResponse.json();
        console.log('API response:', responseData);
        
        // Update personalized model status from API response
        if (responseData.meta && typeof responseData.meta.is_personalized === 'boolean') {
          setIsPersonalizedModel(responseData.meta.is_personalized);
          console.log(`API confirms user ${responseData.meta.is_personalized ? 'has' : 'does not have'} a personalized model`);
        }
        
        // Handle different response formats
        if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          console.log(`Got ${responseData.data.length} recommendations from data field`);
          setRecommendations(responseData.data);
        } else if (responseData.recommendations && Array.isArray(responseData.recommendations) && responseData.recommendations.length > 0) {
          console.log(`Got ${responseData.recommendations.length} recommendations from recommendations field`);
          setRecommendations(responseData.recommendations);
        } else if (Array.isArray(responseData) && responseData.length > 0) {
          console.log(`Got ${responseData.length} recommendations from root array`);
          setRecommendations(responseData);
        } else {
          console.error('No recommendations found in response:', responseData);
          
          // If no recommendations but we have a personalized model, explain that to the user
          if (responseData.meta?.is_personalized) {
            setError('No personalized recommendations available yet. Try swiping on more products to improve your model.');
          } else {
            setError('No personalized recommendations available');
          }
        }
      } else {
        console.error('Failed to fetch recommendations:', await recResponse.text());
        setError('Failed to load recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile, interactions stats, and recommendations on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch user profile
        const profileResponse = await fetch(`/api/profile?user_id=${USER_ID}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile(profileData);
          
          // Parse and set style preferences
          const styles = parseStylePreferences(profileData);
          setStylePreferences(styles);
          
          // Check if user has completed their style profile - we just need their styles
          if (profileData) {
            console.log('Got profile data:', profileData);
            console.log('Style preferences:', styles);
            
            // Fetch recommendations
            await fetchRecommendations();
          }
        } else {
          console.error('Failed to fetch user profile:', await profileResponse.text());
          setError('Failed to load user profile');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load recommendations');
      }
    };
    
    fetchData();
  }, []);

  // Add a function to handle model retraining completion
  const handleRetrainComplete = () => {
    console.log('Model retraining complete - refreshing recommendations');
    fetchRecommendations(); // Re-fetch recommendations with the newly trained model
  };

  return (
    <>
      <div className="container px-4 py-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">For You</h1>
            <p className="text-muted-foreground">
              Products curated based on your style preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StyleSwiper 
              trigger={
                <Button variant="outline" size="sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Explore Styles
                </Button>
              }
              userId={USER_ID}
              onRetrainComplete={handleRetrainComplete}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            {error}
          </div>
        )}

        {isPersonalizedModel && (
          <div className="p-3 bg-green-50 rounded-md border border-green-100 mb-4">
            <p className="text-sm text-green-800 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Using your personalized style model for recommendations
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border rounded-md overflow-hidden">
                <Skeleton className="h-[300px] w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations.map((product, index) => {
              // Ensure we have a valid product ID
              const productId = product.product_id || product.id || `unknown-${index}`;
              return (
                <Link 
                  href={`/product/${productId}`}
                  key={`product-${productId}-${index}`}
                  className="group border rounded-md overflow-hidden"
                >
                  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200">
                    <img
                      src={product.image_url || '/placeholder-product.png'}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">${product.price?.toFixed(2) || 'N/A'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {recommendations.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No recommendations found</h3>
            <p className="text-muted-foreground mt-2">
              Update your style profile to get personalized recommendations
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <Button asChild>
                <Link href="/onboarding">Complete Style Profile</Link>
              </Button>
              <StyleExplorer trigger={
                <Button variant="outline">
                  <Shirt className="h-4 w-4 mr-2" />
                  Explore Styles
                </Button>
              } />
            </div>
          </div>
        )}
      </div>
    </>
  );
} 