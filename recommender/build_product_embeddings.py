#!/usr/bin/env python
"""
build_product_embeddings.py

This script loads the product catalog from 'data/combined_cleaned_latest.csv',
combines product_name and description into a text field, encodes the texts using a
pretrained SentenceTransformer model, and saves the embeddings to 'models/product_embeddings.npy'.
"""

import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import os

def main():
    # Ensure the models directory exists
    os.makedirs("models", exist_ok=True)
    
    # Load product catalog
    catalog_file = "data/combined_cleaned_latest.csv"
    df = pd.read_csv(catalog_file)
    
    # Combine product_name and description into one text field
    df['text'] = df['product_name'].fillna('') + " " + df['description'].fillna('')
    df = df[df['text'].str.strip().astype(bool)]
    print(f"Loaded {len(df)} products from the catalog.")
    
    # Load the SentenceTransformer model
    model = SentenceTransformer("all-MiniLM-L6-v2")
    
    # Encode all product texts
    print("Encoding product descriptions...")
    product_texts = df['text'].tolist()
    embeddings = model.encode(product_texts, show_progress_bar=True)
    
    # Save the embeddings
    np.save("models/product_embeddings.npy", embeddings)
    print("Product embeddings saved to 'models/product_embeddings.npy'.")
    
if __name__ == "__main__":
    main()
