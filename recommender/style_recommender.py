#!/usr/bin/env python
"""
style_recommender.py

This module defines the StyleRecommender class.
It loads the product catalog (CSV) and precomputed product embeddings (.npy),
and provides a method to recommend products based on user style preferences.
"""

import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import json
import argparse
import sys
from typing import List, Dict

class StyleRecommender:
    def __init__(self, catalog_path: str, embeddings_path: str):
        # Load catalog and combine text fields
        self.df = pd.read_csv(catalog_path)
        self.df['text'] = self.df['product_name'].fillna('') + " " + self.df['description'].fillna('')
        self.df = self.df[self.df['text'].str.strip().astype(bool)]
        
        # Load precomputed embeddings
        self.embeddings = np.load(embeddings_path)
        
        # Load the SentenceTransformer model for encoding user preferences
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
    
    def recommend(self, preferences: list[str], top_n: int = 10) -> list[dict]:
        """
        Recommend products based on user style preferences.
        
        Parameters:
            preferences (list[str]): List of user preference strings.
            top_n (int): Number of recommendations to return.
        
        Returns:
            List[dict]: Recommended product details.
        """
        if not preferences:
            raise ValueError("You must provide a list of preference strings.")
        
        # Encode preferences and compute the mean vector
        pref_embeddings = self.model.encode(preferences)
        user_vector = np.mean(pref_embeddings, axis=0)
        
        # Compute cosine similarity between user_vector and catalog embeddings
        sims = cosine_similarity([user_vector], self.embeddings)[0]
        self.df["similarity"] = sims
        
        # Get top_n recommendations
        top_df = self.df.sort_values(by="similarity", ascending=False).head(top_n)
        recommendations = []
        for _, row in top_df.iterrows():
            recommendations.append({
                "product_id": row.get("product_id", ""),
                "product_name": row.get("product_name", ""),
                "description": row.get("description", ""),
                "similarity": round(row["similarity"], 3)
            })
        return recommendations

def get_style_recommendations(product: Dict, df: pd.DataFrame, n: int = 5) -> List[Dict]:
    """
    Get style recommendations based on product embeddings.
    
    Args:
        product: Product data dictionary
        df: DataFrame containing all products
        n: Number of recommendations to return
        
    Returns:
        List[Dict]: List of recommended products with similarity scores
    """
    # Extract product ID
    product_id = product['product_id']
    
    # Get product category
    product_category = product['category']
    
    # Assuming we have embedding columns like 'embedding_1', 'embedding_2', etc.
    # First, identify embedding columns
    embedding_cols = [col for col in df.columns if col.startswith('embedding_')]
    
    if not embedding_cols:
        # If no embedding columns found, use text features for simple matching
        similar_products = df[df['category'] == product_category].sample(n)
        similar_products['similarity_score'] = 0.5  # Default similarity score
        return similar_products
    
    # Get the product embeddings
    product_embedding = np.array([product.get(col, 0) for col in embedding_cols]).reshape(1, -1)
    
    # Calculate similarity with all other products
    # Filter out the current product
    other_products = df[df['product_id'] != product_id].copy()
    
    # Get embeddings for other products
    other_embeddings = other_products[embedding_cols].values
    
    # Calculate cosine similarity
    similarities = cosine_similarity(product_embedding, other_embeddings)[0]
    
    # Add similarity scores to the dataframe
    other_products['similarity_score'] = similarities
    
    # Sort by similarity score and return top n
    recommendations = other_products.sort_values('similarity_score', ascending=False).head(n)
    
    # Convert to list of dictionaries with selected fields
    result = []
    for _, rec in recommendations.iterrows():
        result.append({
            'product_id': rec['product_id'],
            'name': rec['name'],
            'category': rec['category'],
            'image_url': rec.get('image_url', ''),
            'price': float(rec.get('price', 0)),
            'similarity_score': float(rec['similarity_score'])
        })
    
    return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Get style recommendations')
    parser.add_argument('--product_data', type=str, required=True, help='Product data as JSON string')
    parser.add_argument('--limit', type=int, default=5, help='Number of recommendations to return')
    
    args = parser.parse_args()
    
    try:
        # Load the dataset
        df = pd.read_csv('recommender/data/combined_cleaned_latest.csv')
        
        # Parse product data
        product_data = json.loads(args.product_data)
        
        # Get recommendations
        recommendations = get_style_recommendations(product_data, df, args.limit)
        
        # Print results as JSON
        print(json.dumps({
            'recommendations': recommendations,
            'source_product_id': product_data.get('product_id', ''),
            'source_product_name': product_data.get('name', '')
        }))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)
