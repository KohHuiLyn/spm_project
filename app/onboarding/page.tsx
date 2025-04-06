'use client';

import React, { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// Common materials from our dataset
const materialOptions = [
  { id: 'cotton', name: 'Cotton', description: 'Soft, breathable, natural fabric' },
  { id: 'linen', name: 'Linen', description: 'Lightweight, breathable, natural fabric' },
  { id: 'polyester', name: 'Polyester', description: 'Durable, wrinkle-resistant synthetic fabric' },
  { id: 'silk', name: 'Silk', description: 'Luxurious, smooth natural fabric' },
  { id: 'wool', name: 'Wool', description: 'Warm, natural fabric from animal hair' },
  { id: 'denim', name: 'Denim', description: 'Sturdy cotton twill fabric' },
  { id: 'viscose', name: 'Viscose', description: 'Soft, breathable semi-synthetic fabric' },
  { id: 'acrylic', name: 'Acrylic', description: 'Synthetic alternative to wool' },
  { id: 'tweed', name: 'Tweed', description: 'Rough, woolen fabric with a textured appearance' },
  { id: 'knit', name: 'Knit', description: 'Versatile fabric created by interlocking loops of yarn' },
];

// Sizing options for users
const sizingOptions = [
  { id: 'height', label: 'Height (cm)', type: 'number', placeholder: 'Enter your height in cm' },
  { id: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'Enter your weight in kg' },
  { id: 'bust', label: 'Bust (inches)', type: 'number', placeholder: 'Enter your bust measurement in inches' },
  { id: 'waist', label: 'Waist (inches)', type: 'number', placeholder: 'Enter your waist measurement in inches' },
  { id: 'hips', label: 'Hips (inches)', type: 'number', placeholder: 'Enter your hip measurement in inches' },
  { id: 'chest', label: 'Chest (inches)', type: 'number', placeholder: 'Enter your chest measurement in inches' },
  { id: 'ptp', label: 'Pit to Pit (inches)', type: 'number', placeholder: 'Enter your pit to pit measurement in inches' },
];

// Interface for product data
interface Product {
  product_id?: string;
  id?: string;
  name: string;
  image_url: string;
  description: string;
  material?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  
  const [textPreference, setTextPreference] = useState<string>('');
  const [sizing, setSizing] = useState<{[key: string]: string}>({});

  // Load products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch products from the API
        const response = await fetch('/api/products?limit=12&order=name');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const { data } = await response.json();
        
        if (data && data.length > 0) {
          // Ensure we have the product_id field (using id as fallback)
          const formattedProducts = data.map(product => ({
            ...product,
            product_id: product.product_id || product.id,
          }));
          
          setProducts(formattedProducts);
        } else {
          // Fallback to mock products if no data
          setProducts([
            {
              product_id: "mock1",
              name: "Cotton T-Shirt",
              image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
              description: "Casual cotton t-shirt for everyday wear",
              material: "Cotton"
            },
            {
              product_id: "mock2",
              name: "Denim Jeans",
              image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
              description: "Classic denim jeans with comfortable fit",
              material: "Denim"
            },
            {
              product_id: "mock3", 
              name: "Wool Sweater",
              image_url: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
              description: "Warm wool sweater for cold weather",
              material: "Wool"
            },
            {
              product_id: "mock4",
              name: "Linen Shirt",
              image_url: "https://images.unsplash.com/photo-1600247354058-19dcb0ccd0b9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80", 
              description: "Breathable linen shirt for summer",
              material: "Linen"
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback to mock products if API fails
        setProducts([
          {
            product_id: "mock1",
            name: "Cotton T-Shirt",
            image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
            description: "Casual cotton t-shirt for everyday wear",
            material: "Cotton"
          },
          {
            product_id: "mock2",
            name: "Denim Jeans",
            image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
            description: "Classic denim jeans with comfortable fit",
            material: "Denim"
          },
          {
            product_id: "mock3", 
            name: "Wool Sweater",
            image_url: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
            description: "Warm wool sweater for cold weather",
            material: "Wool"
          },
          {
            product_id: "mock4",
            name: "Linen Shirt",
            image_url: "https://images.unsplash.com/photo-1600247354058-19dcb0ccd0b9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80", 
            description: "Breathable linen shirt for summer",
            material: "Linen"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const toggleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };
  
  const toggleStyleSelection = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };
  
  const toggleMaterialSelection = (material: string) => {
    if (selectedMaterials.includes(material)) {
      setSelectedMaterials(selectedMaterials.filter(m => m !== material));
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  const handleSizingChange = (id: string, value: string) => {
    setSizing({ ...sizing, [id]: value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Use hardcoded user ID instead of authentication
      const userId = 'e932f5dc-949c-4341-9237-27126ef03bbb';

      // Convert measurements to the correct format
      const bodyMeasurements = {
        height: parseFloat(sizing.height),
        weight: parseFloat(sizing.weight),
        body_measurements: {
          bust: parseFloat(sizing.bust),
          waist: parseFloat(sizing.waist),
          hips: parseFloat(sizing.hips),
          chest: parseFloat(sizing.chest),
          ptp: parseFloat(sizing.ptp)
        }
      };

      // Save to style-profile API
      const profileResponse = await fetch('/api/style-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          stylePreferences: selectedStyles,
          material_preferences: selectedMaterials,
          measurements: JSON.stringify(bodyMeasurements),
        }),
      });
      
      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || 'Failed to save preferences');
      }
      
      // Redirect to the products page
      router.push('/products');
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Fallback to localStorage if API fails
      localStorage.setItem('stylePreferences', JSON.stringify(selectedStyles));
      localStorage.setItem('materialPreferences', JSON.stringify(selectedMaterials));
      localStorage.setItem('sizingPreferences', JSON.stringify(sizing));
      
      // Still redirect to products
      router.push('/products');
    } finally {
      setSubmitting(false);
    }
  };

  // Extract a list of styles/tags from products
  const extractStyles = (): string[] => {
    const allTags = new Set<string>();
    
    products.forEach(product => {
      if (product.description) {
        // Potential style terms
        const styleTerms = [
          'casual', 'formal', 'elegant', 'vintage', 'modern',
          'sporty', 'classic', 'bohemian', 'minimalist', 'romantic',
          'streetwear', 'party', 'work', 'date', 'festive', 'travel',
        ];
        
        const lowerDesc = product.description.toLowerCase();
        styleTerms.forEach(term => {
          if (lowerDesc.includes(term)) {
            // Capitalize for display
            allTags.add(term.charAt(0).toUpperCase() + term.slice(1));
          }
        });
      }
    });
    
    return Array.from(allTags);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <nav className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Style Profile</span>
        </nav>
        <h1 className="text-3xl font-bold mb-2">Create Your Style Profile</h1>
        <p className="text-muted-foreground">
          Help us understand your preferences to recommend products that match your style.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`flex-1 border-b-2 ${step >= 1 ? 'border-blue-600' : 'border-gray-200'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
          <p className="text-xs">Product Preferences</p>
        </div>
        <div className={`flex-1 border-b-2 ${step >= 2 ? 'border-blue-600' : 'border-gray-200'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
          <p className="text-xs">Style & Materials</p>
        </div>
        <div className={`flex-1 border-b-2 ${step >= 3 ? 'border-blue-600' : 'border-gray-200'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
          <p className="text-xs">Body Measurements</p>
        </div>
        <div className={`flex-1 border-b-2 ${step >= 4 ? 'border-blue-600' : 'border-gray-200'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>4</div>
          <p className="text-xs">Complete</p>
        </div>
      </div>

      {/* Step 1: Product Preferences */}
      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Products You Like</CardTitle>
              <CardDescription>
                Choose products that match your style (select multiple)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Array(8).fill(0).map((_, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="relative aspect-square">
                        <Skeleton className="h-full w-full" />
                      </div>
                      <div className="p-3">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {products.map((product) => {
                    const pId = product.product_id || product.id || '';
                    return (
                      <div 
                        key={pId}
                        onClick={() => toggleProductSelection(pId)}
                        className={`cursor-pointer border rounded-lg overflow-hidden transition-all relative ${
                          selectedProducts.includes(pId)
                            ? 'ring-2 ring-blue-600 border-blue-600'
                            : 'hover:shadow-md'
                        }`}
                      >
                        {selectedProducts.includes(pId) && (
                          <div className="absolute top-2 right-2 z-10 bg-blue-600 rounded-full p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="relative aspect-square">
                          <Image
                            src={product.image_url || '/placeholder.svg?height=300&width=300'}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm truncate">{product.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {product.material && (
                              <span className="text-xs font-medium">{product.material}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
              >
                Skip for Now
              </Button>
              <Button 
                onClick={() => setStep(2)} 
                disabled={selectedProducts.length === 0}
              >
                Next Step
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Step 2: Style & Materials */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Style Preferences</CardTitle>
              <CardDescription>
                Select your style preferences and favorite materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Style Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {extractStyles().map((style) => (
                    <button
                      key={style}
                      onClick={() => toggleStyleSelection(style)}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedStyles.includes(style)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-3">Preferred Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {materialOptions.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => toggleMaterialSelection(material.id)}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedMaterials.includes(material.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } transition-colors`}
                      title={material.description}
                    >
                      {material.name}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Describe your style in your own words (optional)
                </label>
                <Input
                  as="textarea"
                  rows={3}
                  placeholder="e.g., I love oversized cozy sweaters with leggings, or minimal Scandinavian designs with clean lines..."
                  value={textPreference}
                  onChange={(e) => setTextPreference(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={selectedStyles.length === 0 && selectedMaterials.length === 0 && !textPreference}
              >
                Next Step
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Step 3: Body Measurements */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Body Measurements</CardTitle>
              <CardDescription>
                Help us recommend the right sizes for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sizingOptions.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <label className="block text-sm font-medium">
                      {option.label}
                    </label>
                    <Input
                      type={option.type}
                      placeholder={option.placeholder}
                      value={sizing[option.id] || ''}
                      onChange={(e) => handleSizingChange(option.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(4)}
                disabled={!sizing.height || !sizing.weight}
              >
                Next Step
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Set!</CardTitle>
              <CardDescription>
                We'll use your preferences to recommend products that match your style
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  className="w-10 h-10 text-green-600"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Your Style Profile is Ready</h3>
              <p className="text-muted-foreground mt-2">
                We've saved your preferences and will use them to enhance your shopping experience.
              </p>
              
              <div className="mt-6 text-sm">
                <h4 className="font-medium mb-2">Your Preferences Summary:</h4>
                <ul className="space-y-1">
                  <li>Liked Products: {selectedProducts.length} products</li>
                  <li>Style Tags: {selectedStyles.join(', ') || 'None selected'}</li>
                  <li>
                    Material Preferences:{' '}
                    {selectedMaterials
                      .map(id => materialOptions.find(m => m.id === id)?.name)
                      .join(', ') || 'None selected'}
                  </li>
                  <li>Body Measurements: Height {sizing.height}cm, Weight {sizing.weight}kg</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Browse Products'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
