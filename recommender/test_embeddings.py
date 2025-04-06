#!/usr/bin/env python
"""
test_embeddings.py

A simple script to test if the embeddings are working correctly.
It will:
1. Load the embeddings
2. Try to make some sample recommendations
3. Print the results
"""

import os
import sys
from style_recommender import StyleRecommender

def main():
    # Set environment variables with actual Supabase credentials
    os.environ["NEXT_PUBLIC_SUPABASE_URL"] = "https://ihtawqdnvidkrifhplkw.supabase.co"
    os.environ["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlodGF3cWRudmlka3JpZmhwbGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMjc2NTksImV4cCI6MjA1ODkwMzY1OX0.1zMVO33CW8BEuW9p0MR_3W2k3eJM6GWXn4tgbKzqpNI"
    
    # Get the directory of this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Initialize the recommender with correct paths
    print("Initializing StyleRecommender...")
    recommender = StyleRecommender(
        embeddings_path=os.path.join(current_dir, "models", "product_embeddings.npy")
    )
    
    # Test with some sample preferences
    test_preferences = [
        "casual t-shirt",
        "jeans",
        "sneakers"
    ]
    
    print("\nTesting recommendations with preferences:", test_preferences)
    try:
        recommendations = recommender.recommend(
            preferences=test_preferences,
            top_n=5
        )
        
        if recommendations:
            print("\nRecommendations:")
            for i, rec in enumerate(recommendations, 1):
                print(f"{i}. {rec.get('name', 'No name')} - {rec.get('description', 'No description')}")
                print(f"   Score: {rec.get('similarity_score', 0):.3f}")
        else:
            print("\nNo recommendations found. This could mean either:")
            print("1. No products matched the preferences")
            print("2. There might be an issue with the embeddings or product data")
    except Exception as e:
        print(f"\nError while getting recommendations: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 