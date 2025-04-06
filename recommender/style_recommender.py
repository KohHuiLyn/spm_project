#!/usr/bin/env python
"""
style_recommender.py

This module provides personalized product recommendations based on user style and material preferences.
It loads product details from Supabase and uses precomputed product embeddings stored in the models folder.
"""

import json
import argparse
import sys
import os
import time
from typing import List, Dict, Any, Optional

import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from supabase import create_client
from dotenv import load_dotenv

try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase-py: pip install supabase", file=sys.stderr)
    sys.exit(1)

# Load environment variables from .env file
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
env_path = os.path.join(root_dir, '.env')

print(f"[ENV] Current directory: {current_dir}", file=sys.stderr)
print(f"[ENV] Root directory: {root_dir}", file=sys.stderr)
print(f"[ENV] .env path: {env_path} (exists: {os.path.exists(env_path)})", file=sys.stderr)

if not os.path.exists(env_path):
    print(f"[ENV] WARNING: .env file not found at {env_path}", file=sys.stderr)
    print(f"[ENV] Current working directory: {os.getcwd()}", file=sys.stderr)
    print(f"[ENV] Directory contents: {os.listdir(os.getcwd())}", file=sys.stderr)

print(f"[ENV] Loading environment from {env_path}", file=sys.stderr)
load_dotenv(env_path)

# Print environment variables for debugging
print(f"[ENV] NEXT_PUBLIC_SUPABASE_URL: {os.getenv('NEXT_PUBLIC_SUPABASE_URL')}", file=sys.stderr)
print(f"[ENV] NEXT_PUBLIC_SUPABASE_ANON_KEY: {'Set' if os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') else 'Not set'}", file=sys.stderr)

def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    print(f"Using Supabase URL: {url and 'Set' or 'Not set'}", file=sys.stderr)
    print(f"Using Supabase Key: {key and 'Set' or 'Not set'}", file=sys.stderr)
    
    if not url or not key:
        print("SUPABASE_URL and SUPABASE_KEY must be set.", file=sys.stderr)
        return None
    try:
        print(f"Connecting to Supabase for user ID: {user_id}", file=sys.stderr)
        supabase: Client = create_client(url, key)
        response = supabase.table("profiles").select("*").eq("user_id", user_id).execute()
        print(f"Got response: {response}", file=sys.stderr)
        data = response.data
        if not data:
            print(f"No profile found for user ID: {user_id}", file=sys.stderr)
            return None
        print(f"Found profile for user ID: {user_id}", file=sys.stderr)
        return data[0]
    except Exception as e:
        print(f"Error in get_user_profile: {e}", file=sys.stderr)
        return None


class StyleRecommender:
    def __init__(self, embeddings_path=None, user_id=None):
        """Initialize the style recommender with product embeddings."""
        self.user_id = user_id
        try:
            print(f"[RECOMMEND] Initializing style recommender with default model", file=sys.stderr)
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            print(f"[RECOMMEND] Default model loaded successfully", file=sys.stderr)
        except Exception as e:
            print(f"[RECOMMEND] Error loading default model: {str(e)}", file=sys.stderr)
            sys.exit(1)

        # Load product embeddings and IDs
        try:
            print(f"[RECOMMEND] Loading product embeddings from recommender/models/", file=sys.stderr)
            self.product_ids = np.load('recommender/models/product_ids.npy', allow_pickle=True)
            self.product_embeddings = np.load('recommender/models/product_embeddings.npy')
            print(f"[RECOMMEND] Loaded {len(self.product_ids)} product embeddings with shape {self.product_embeddings.shape}", file=sys.stderr)
        except Exception as e:
            print(f"[RECOMMEND] Error loading product embeddings: {str(e)}", file=sys.stderr)
            sys.exit(1)

        # Load user-specific model and embeddings if available
        if user_id:
            user_model_dir = f"recommender/models/{user_id}_model"
            if os.path.exists(user_model_dir):
                print(f"[RECOMMEND] Loading user model from: {user_model_dir}", file=sys.stderr)
                try:
                    self.model = SentenceTransformer(user_model_dir)
                    print(f"[RECOMMEND] Successfully loaded user model from {user_model_dir}", file=sys.stderr)
                except Exception as e:
                    print(f"[RECOMMEND] Error loading model from {user_model_dir}: {str(e)}", file=sys.stderr)
                    print(f"[RECOMMEND] Falling back to default model", file=sys.stderr)
                    self.model = SentenceTransformer('all-MiniLM-L6-v2')
                
                # Load user embeddings if available
                user_embeddings_path = os.path.join(user_model_dir, "embeddings.npy")
                if os.path.exists(user_embeddings_path):
                    try:
                        print("[RECOMMEND] Loading user embeddings", file=sys.stderr)
                        self.user_embeddings = np.load(user_embeddings_path)
                        self.user_texts = np.load(os.path.join(user_model_dir, "texts.npy"))
                        print(f"[RECOMMEND] Loaded {len(self.user_embeddings)} user embeddings", file=sys.stderr)
                    except Exception as e:
                        print(f"[RECOMMEND] Error loading user embeddings: {str(e)}", file=sys.stderr)
                        self.user_embeddings = None
                        self.user_texts = None
                else:
                    print("[RECOMMEND] No user embeddings found", file=sys.stderr)
                    self.user_embeddings = None
                    self.user_texts = None
            else:
                print(f"[RECOMMEND] No user model found for {user_id}", file=sys.stderr)
                self.user_embeddings = None
                self.user_texts = None

    def recommend(self, query=None, materials=None, top_k=10):
        """Generate recommendations based on query and materials."""
        try:
            # Encode the query
            if query:
                print(f"[RECOMMEND] Encoding query: {str(query)[:50]}...", file=sys.stderr)
                # Encode each preference and average them
                query_embeddings = self.model.encode(query)
                query_embedding = np.mean(query_embeddings, axis=0)
                print(f"[RECOMMEND] Query encoded successfully with shape {query_embedding.shape}", file=sys.stderr)
            elif self.user_embeddings is not None:
                # Use average of user embeddings as query
                print(f"[RECOMMEND] Using average of {len(self.user_embeddings)} user embeddings as query", file=sys.stderr)
                query_embedding = np.mean(self.user_embeddings, axis=0)
                print(f"[RECOMMEND] User embedding mean shape: {query_embedding.shape}", file=sys.stderr)
            else:
                print("[RECOMMEND] No query or user embeddings available", file=sys.stderr)
                return []

            # Calculate similarity scores
            print(f"[RECOMMEND] Product embeddings shape: {self.product_embeddings.shape}", file=sys.stderr)
            scores = cosine_similarity([query_embedding], self.product_embeddings)[0]
            print(f"[RECOMMEND] Calculated similarity scores, min: {min(scores)}, max: {max(scores)}", file=sys.stderr)

            # Get top-k recommendations
            top_indices = np.argsort(scores)[-top_k:][::-1]
            print(f"[RECOMMEND] Top {len(top_indices)} indices: {top_indices}", file=sys.stderr)
            recommendations = []
            
            # Get product details for recommendations
            product_ids = [str(self.product_ids[idx]) for idx in top_indices if scores[idx] > -1]
            print(f"[RECOMMEND] Found {len(product_ids)} product IDs to fetch details for", file=sys.stderr)
            if product_ids:
                # Get Supabase client
                supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
                supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
                print(f"[RECOMMEND] Supabase URL: {supabase_url}", file=sys.stderr)
                print(f"[RECOMMEND] Supabase Key: {supabase_key and 'Set' or 'Not set'}", file=sys.stderr)
                if not supabase_url or not supabase_key:
                    print("[RECOMMEND] Supabase environment variables not set", file=sys.stderr)
                    # Return basic recommendations without details
                    for idx in top_indices:
                        if scores[idx] > -1:
                            recommendations.append({
                                'product_id': str(self.product_ids[idx]),
                                'score': float(scores[idx])
                            })
                    return recommendations

                try:
                    print(f"[RECOMMEND] Creating Supabase client with URL: {supabase_url}", file=sys.stderr)
                    supabase = create_client(supabase_url, supabase_key)
                    print("[RECOMMEND] Supabase client created successfully", file=sys.stderr)
                except Exception as e:
                    print(f"[RECOMMEND] Error creating Supabase client: {str(e)}", file=sys.stderr)
                    raise
                
                # Get product details
                try:
                    print(f"[RECOMMEND] Fetching product details from Supabase for {len(product_ids)} products", file=sys.stderr)
                    product_details = supabase.table('products').select('*').in_('product_id', product_ids).execute()
                    product_details = {str(item['product_id']): item for item in product_details.data}
                    print(f"[RECOMMEND] Got details for {len(product_details)} products", file=sys.stderr)

                    for idx in top_indices:
                        if scores[idx] > -1:  # Only include products that weren't filtered out
                            product_id = str(self.product_ids[idx])
                            if product_id in product_details:
                                product = product_details[product_id]
                                recommendations.append({
                                    'product_id': product_id,
                                    'score': float(scores[idx]),
                                    'name': product.get('name', ''),
                                    'description': product.get('description', ''),
                                    'category': product.get('category', ''),
                                    'image_url': product.get('image_url', ''),
                                    'price': float(product.get('price', 0)),
                                    'material': product.get('material', '')
                                })
                            else:
                                # If product details not found, add basic info
                                recommendations.append({
                                    'product_id': product_id,
                                    'score': float(scores[idx])
                                })
                except Exception as e:
                    print(f"[RECOMMEND] Error getting product details: {str(e)}", file=sys.stderr)
                    # Return basic recommendations if product details fetch fails
                    for idx in top_indices:
                        if scores[idx] > -1:
                            recommendations.append({
                                'product_id': str(self.product_ids[idx]),
                                'score': float(scores[idx])
                            })

            return recommendations

        except Exception as e:
            print(f"[RECOMMEND] Error during recommendation: {str(e)}", file=sys.stderr)
            return []


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Get style recommendations')
    parser.add_argument('--user_preferences', type=str, help='User style preferences as JSON array of strings')
    parser.add_argument('--user_materials', type=str, help='User material preferences as JSON array of strings')
    parser.add_argument('--user_id', type=str, help='User ID to fetch profile from Supabase')
    parser.add_argument('--limit', type=int, default=5, help='Number of recommendations to return')
    
    args = parser.parse_args()
    
    user_preferences = []
    if args.user_preferences:
        try:
            user_preferences = json.loads(args.user_preferences)
            print(f"Using provided user preferences: {user_preferences}", file=sys.stderr)
        except Exception as e:
            print(f"Error parsing user preferences: {e}", file=sys.stderr)
    
    user_materials = []
    if args.user_materials:
        try:
            user_materials = json.loads(args.user_materials)
            print(f"Using provided user materials: {user_materials}", file=sys.stderr)
        except Exception as e:
            print(f"Error parsing user materials: {e}", file=sys.stderr)
    
    # If product_data is provided, use the embedding model to find similar items
    if args.__dict__.get('product_data'):
        try:
            product_data = json.loads(args.__dict__.get('product_data'))
            product_id = product_data.get('product_id')
            
            print(f"Getting style recommendations for product {product_id}", file=sys.stderr)
            
            # Initialize the recommender with user_id if available
            recommender = StyleRecommender(user_id=args.user_id)
            
            # Use the embedding-based recommender always
            recommendations = recommender.recommend(
                query=user_preferences,
                materials=user_materials,
                top_k=args.limit
            )
            
            print(f"Generated {len(recommendations)} recommendations using {'personalized' if recommender.user_id else 'default'} model", file=sys.stderr)
        except Exception as e:
            print(f"Error in style recommendation: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print(f"Getting general style recommendations for user {args.user_id or 'unknown'}", file=sys.stderr)
        try:
            recommender = StyleRecommender(user_id=args.user_id)
            
            # Process user preferences
            query_input = None
            if user_preferences:
                # If user preferences are strings (style descriptions), use them directly
                if isinstance(user_preferences, list) and all(isinstance(p, str) for p in user_preferences):
                    query_input = user_preferences
                    print(f"Using {len(user_preferences)} style preferences as query", file=sys.stderr)

            recommendations = recommender.recommend(
                query=query_input,
                materials=user_materials,
                top_k=args.limit
            )
            
            # Ensure we always have at least an empty list for recommendations
            if recommendations is None:
                print(f"Warning: recommendations is None, setting to empty list", file=sys.stderr)
                recommendations = []
                
            print(f"Generated {len(recommendations)} recommendations using {'personalized' if recommender.user_id else 'default'} model", file=sys.stderr)
        except Exception as e:
            print(f"Error in style recommendation: {e}", file=sys.stderr)
            # Even on error, return a valid JSON response
            results = {
                "data": [],
                "count": 0,
                "recommendations": [],
                "error": str(e),
                "metadata": {
                    "user_id": args.user_id,
                    "error_message": str(e)
                }
            }
            print(json.dumps(results))
            sys.exit(1)
    
    results = {
        "data": recommendations,
        "count": len(recommendations),
        "recommendations": recommendations,
        "metadata": {
            "user_id": args.user_id,
            "user_preferences": user_preferences,
            "user_materials": user_materials,
            "is_personalized": bool(args.user_id and os.path.exists(os.path.join('recommender/models', f"{args.user_id}_model")))
        }
    }
    
    # Only output the JSON to stdout
    print(json.dumps(results))
