#!/usr/bin/env python
"""
main.py

This demo script simulates the overall flow of the fashion recommender system.
It:
  1. Loads the precomputed product embeddings and catalog.
  2. Uses the StyleRecommender class to generate recommendations based on dummy onboarding preferences.
  3. (Optionally) Simulates swipe feedback and retraining.
"""

from style_recommender import StyleRecommender
from retrain_model import retrain_user_model
import numpy as np

def demo_recommendations():
    # Initialize recommender with the base catalog and embeddings
    recommender = StyleRecommender(
        catalog_path="data/combined_cleaned_latest.csv",
        embeddings_path="models/product_embeddings.npy"
    )
    
    # Dummy onboarding preferences
    user_preferences = [
        "flowy pastel summer dress made of cotton",
        "oversized casual beige shirt",
        "neutral tone minimalist wide-leg pants"
    ]
    
    print("=== Initial Recommendations ===")
    initial_recs = recommender.recommend(user_preferences, top_n=5)
    for rec in initial_recs:
        print(rec)

def demo_retraining():
    # Dummy liked/disliked descriptions from swipe data
    user_id = "13ec1f63-41cd-466c-a2a0-7df9c6d13e3f"
    liked = [
        "flowy pastel summer dress made of cotton",
        "oversized casual beige shirt"
    ]
    disliked = [
        "tight synthetic red bodycon dress"
    ]
    
    # Fine-tune the model for this user
    model_dir = retrain_user_model(user_id, liked, disliked)
    print("User-specific model saved at:", model_dir)
    
    # In a real system, you would re-encode the catalog with the new model.
    # For demo, we'll load the fine-tuned model and generate new recommendations.
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(model_dir)
    
    # Assume we still use the same catalog embeddings (for demo) or re-encode them.
    # We'll simulate a new user vector using the fine-tuned model.
    new_user_vector = model.encode(["flowy pastel summer dress made of cotton",
                                     "oversized casual beige shirt",
                                     "neutral tone minimalist wide-leg pants"])
    new_user_vector = np.mean(new_user_vector, axis=0)
    
    # Load the catalog embeddings from the base model (for demo)
    import pandas as pd
    from sklearn.metrics.pairwise import cosine_similarity
    df = pd.read_csv("data/combined_cleaned_latest.csv")
    df['text'] = df['product_name'].fillna('') + " " + df['description'].fillna('')
    df = df[df['text'].str.strip().astype(bool)]
    
    # For simplicity, use the base product embeddings (in production, re-encode with the fine-tuned model)
    product_embeddings = np.load("models/product_embeddings.npy")
    sims = cosine_similarity([new_user_vector], product_embeddings)[0]
    df["similarity"] = sims
    top_df = df.sort_values(by="similarity", ascending=False).head(5)
    
    print("=== Recommendations after Retraining ===")
    for idx, row in top_df.iterrows():
        print({
            "product_id": row.get("product_id", ""),
            "product_name": row.get("product_name", ""),
            "description": row.get("description", ""),
            "similarity": round(row["similarity"], 3)
        })

if __name__ == "__main__":
    print("Demo: Initial Recommendations")
    demo_recommendations()
    print("\nDemo: Retraining based on swipe feedback")
    demo_retraining()
