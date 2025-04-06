'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { createClient } from '@/utils/supabase/client';

interface SizeRecommenderProps {
  productId: string;
}

interface UserMeasurements {
  [key: string]: number;
}

export default function SizeRecommender({ productId }: SizeRecommenderProps) {
  const [measurements, setMeasurements] = useState<UserMeasurements>({});
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('basic');

  // Hardcoded user ID
  const USER_ID = 'e932f5dc-949c-4341-9237-27126ef03bbb';
  
  // The detailed measurement fields you expect.
  const measurementFields = [
    { id: 'bust', label: 'Bust (inches)', placeholder: '35' },
    { id: 'waist', label: 'Waist (inches)', placeholder: '30' },
    { id: 'hips', label: 'Hips (inches)', placeholder: '38' },
    { id: 'chest', label: 'Chest (inches)', placeholder: '36' },
    { id: 'ptp', label: 'Pit to Pit (inches)', placeholder: '18' }
  ];

  // Fetch user profile once on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        
        // Use hardcoded user ID
        const profileResponse = await fetch(`/api/profile?user_id=${USER_ID}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile(profileData);
          if (profileData && profileData.measurements) {
            try {
              const parsed = JSON.parse(profileData.measurements);
  
              if (parsed.height) setHeight(parsed.height.toString());
              if (parsed.weight) setWeight(parsed.weight.toString());
  
              // Get measurements from either body_measurements or directly from the measurements object
              const userMeasurements = parsed.body_measurements || parsed;
              if (Object.keys(userMeasurements).length > 0) {
                // No need to convert - measurements are already in inches
                setMeasurements(userMeasurements);
  
                // Call recommendSizeFromProfile with the measurements
                recommendSizeFromProfile({
                  height: parsed.height,
                  weight: parsed.weight,
                  body_measurements: userMeasurements,
                });
              } else {
                console.log("No detailed measurements available, skipping auto recommendation.");
              }
  
            } catch (e) {
              console.error('Error parsing measurements data from profile:', e);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };
  
    fetchUserProfile();
  }, []);
    

  // This function now builds a payload that always includes a measurements object.
  const recommendSizeFromProfile = async (measData: { height: number; weight: number; body_measurements?: UserMeasurements }) => {
    setLoading(true);
    setError(null);
    setRecommendedSize(null);
    setConfidence(null);
    setMethod(null);
    
    try {
      // Filter out zero measurements from both sources
      const profileMeasurements = measData.body_measurements || {};
      const filteredProfileMeasurements = { ...profileMeasurements };
      for (const key in filteredProfileMeasurements) {
        if (!filteredProfileMeasurements[key] || filteredProfileMeasurements[key] === 0) {
          delete filteredProfileMeasurements[key];
        }
      }
      
      const localMeasurements = { ...measurements };
      for (const key in localMeasurements) {
        if (!localMeasurements[key] || localMeasurements[key] === 0) {
          delete localMeasurements[key];
        }
      }
      
      // Use filtered measurements with actual values
      const detailedMeasurements = 
        Object.keys(filteredProfileMeasurements).length > 0
          ? filteredProfileMeasurements
          : Object.keys(localMeasurements).length > 0
            ? localMeasurements
            : undefined;

      // Note: body measurements are in inches
      const payload = {
        user_height: parseFloat(measData.height.toString()),
        user_weight: parseFloat(measData.weight.toString()),
        product_id: productId,
        measurements: detailedMeasurements,
      };

      console.log("Payload for size recommendation:", payload);
      const response = await fetch('/api/products/recommend/size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (response.ok && data && data.recommended_size) {
        console.log("Got size recommendation:", data);
        setRecommendedSize(data.recommended_size);
        setConfidence(data.confidence);
        setMethod(data.method);
        return;
      }
      
      // If we get here with data but response is not ok, there was an error
      if (data && data.error) {
        throw new Error(data.error);
      }
      
      // Generic error if we don't have specifics
      throw new Error('No size recommendation returned from service');
    } catch (error) {
      console.error('Error getting size recommendation:', error);
      setError(error.message || 'Could not get size recommendation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Simple fallback function for estimating size
  const getSimpleEstimate = (height: number, weight: number): string => {
    // Very basic size mapping based on height & weight
    if (weight < 50) return 'XS';
    if (weight < 60) return 'S';
    if (weight < 70) return 'M';
    if (weight < 85) return 'L';
    return 'XL';
  };

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements({ ...measurements, [field]: parseFloat(value) });
  };

  const handleSubmit = async () => {
    if (!height || !weight) {
      setError('Please enter both height and weight');
      return;
    }
    if (isNaN(parseFloat(height)) || isNaN(parseFloat(weight))) {
      setError('Height and weight must be valid numbers');
      return;
    }
    setLoading(true);
    setError(null);
    setRecommendedSize(null);
    setConfidence(null);
    setMethod(null);
    
    try {
      // Only include non-zero measurements
      const filteredMeasurements = { ...measurements };
      for (const key in filteredMeasurements) {
        if (!filteredMeasurements[key] || filteredMeasurements[key] === 0) {
          delete filteredMeasurements[key];
        }
      }
      
      // Note: body measurements are in inches
      const payload = {
        user_height: parseFloat(height),
        user_weight: parseFloat(weight),
        product_id: productId,
        // Only include measurements if they have values
        measurements: Object.keys(filteredMeasurements).length > 0 ? filteredMeasurements : undefined,
      };
      console.log("Payload for manual submit:", payload);
      const response = await fetch('/api/products/recommend/size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (response.ok && data && data.recommended_size) {
        console.log("Got size recommendation:", data);
        setRecommendedSize(data.recommended_size);
        setConfidence(data.confidence);
        setMethod(data.method);
        return;
      }
      
      // If we get here with data but response is not ok, there was an error
      if (data && data.error) {
        throw new Error(data.error);
      }
      
      // Generic error if we don't have specifics
      throw new Error('No size recommendation returned from service');
    } catch (error) {
      console.error('Error getting size recommendation:', error);
      setError(error.message || 'Could not get size recommendation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceLabel = () => {
    if (confidence === null) return '';
    if (confidence > 0.8) return 'Very High';
    if (confidence > 0.6) return 'High';
    if (confidence > 0.4) return 'Medium';
    if (confidence > 0.2) return 'Low';
    return 'Very Low';
  };

  const renderSavedMeasurements = (measData: any) => {
    if (!measData) return null;
    const hasBodyMeasurements = measData.body_measurements && Object.keys(measData.body_measurements).length > 0;
    return (
      <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-100">
        <h3 className="font-medium text-sm mb-2 text-blue-900">Your Saved Measurements</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {measData.height && (
            <div className="flex justify-between">
              <span className="text-gray-600">Height:</span>
              <span className="font-medium">{measData.height} cm</span>
            </div>
          )}
          {measData.weight && (
            <div className="flex justify-between">
              <span className="text-gray-600">Weight:</span>
              <span className="font-medium">{measData.weight} kg</span>
            </div>
          )}
          {hasBodyMeasurements &&
            Object.entries(measData.body_measurements).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                <span className="font-medium">{typeof value === 'number' ? value.toFixed(1) : value} inches</span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderSizeRecommendation = () => {
    if (!recommendedSize) return null;
    const confidenceLabel = getConfidenceLabel();
    const confidenceColor = confidence && confidence > 0.6 ? 'text-green-700' : 'text-yellow-700';
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Our Recommendation</h3>
          <div className={`text-sm ${confidenceColor}`}>{confidenceLabel} Confidence</div>
        </div>
        <div className="text-center my-3">
          <span className="text-3xl font-bold">{recommendedSize}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Based on your {userProfile?.measurements ? 'saved measurements' : 'provided information'}, we recommend size <strong>{recommendedSize}</strong> for the best fit.
        </p>
        {confidence && confidence < 0.5 && (
          <p className="text-xs text-yellow-700 mt-2">
            For a more accurate recommendation, try providing detailed measurements.
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Size Recommender</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="height">Height (cm)</Label>
              <Input 
                id="height" 
                value={height} 
                onChange={(e) => setHeight(e.target.value)} 
                placeholder="175" 
                type="number"
                min="100"
                max="250"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input 
                id="weight" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                placeholder="70" 
                type="number"
                min="30"
                max="200"
              />
            </div>
          </div>
          
          <h3 className="text-sm font-medium mt-4 mb-2">Body Measurements <span className="text-xs text-muted-foreground">(all measurements must be in inches)</span></h3>
          <p className="text-xs text-muted-foreground mb-3">For accurate recommendations, please measure and enter your body measurements in inches.</p>
          
          {measurementFields.map(field => (
            <div key={field.id} className="space-y-1">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input 
                id={field.id} 
                value={measurements[field.id] || ''} 
                onChange={(e) => handleMeasurementChange(field.id, e.target.value)} 
                placeholder={field.placeholder} 
                type="number"
                min="1"
              />
            </div>
          ))}
        </div>
        
        {error && (
          <div className="mt-3 p-3 text-sm bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        {recommendedSize && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <h3 className="font-medium text-lg mb-1">Recommended Size: <span className="font-bold text-xl">{recommendedSize}</span></h3>
            {confidence !== null && (
              <p className="text-sm text-gray-600">
                Confidence: {Math.round(confidence * 100)}%
              </p>
            )}
            {method && (
              <p className="text-sm text-gray-600">
                Method: {method}
              </p>
            )}
          </div>
        )}
        
        {profileLoading && (
          <div className="mt-3 flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading your profile...</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting Size...
            </>
          ) : "Get Size Recommendation"}
        </Button>
      </CardFooter>
    </Card>
  );
}
