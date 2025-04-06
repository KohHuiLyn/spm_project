#!/usr/bin/env python
"""
build_product_embeddings.py

This script loads the product catalog from Supabase (table: 'products'),
combines name and description into a text field, encodes the texts using a
pretrained SentenceTransformer model, and saves the embeddings to
'models/product_embeddings.npy'.
"""

import os
import sys
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

# If you haven't installed supabase-py:
#   pip install supabase

try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase-py: pip install supabase", file=sys.stderr)
    sys.exit(1)


def main():
    # Ensure the models directory exists
    os.makedirs("models", exist_ok=True)

    # --- SUPABASE CLIENT SETUP ---
    # Adjust these environment variable names to match how you store them
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not url or not key:
        print("Error: Supabase URL/Key environment variables not set.", file=sys.stderr)
        sys.exit(1)

    # Create Supabase client
    supabase: Client = create_client(url, key)

    # --- FETCH PRODUCTS FROM SUPABASE ---
    try:
        response = supabase.table("products").select("product_id, name, description").execute()
        data = response.data
        if not data:
            print("No products found in the 'products' table.", file=sys.stderr)
            sys.exit(0)
    except Exception as e:
        print(f"Error fetching products from Supabase: {e}", file=sys.stderr)
        sys.exit(1)

    # Convert fetched data to a pandas DataFrame
    df = pd.DataFrame(data)

    # Combine name and description into one text field
    df['text'] = df['name'].fillna('') + " " + df['description'].fillna('')

    # Filter out empty texts
    df = df[df['text'].str.strip().astype(bool)]
    print(f"Loaded {len(df)} products from Supabase.")

    # Load the SentenceTransformer model
    model = SentenceTransformer("all-MiniLM-L6-v2")

    # Encode all product texts
    print("Encoding product descriptions...")
    product_texts = df['text'].tolist()
    embeddings = model.encode(product_texts, show_progress_bar=True)

    # Optionally, save product IDs alongside embeddings to match them later
    product_ids = df['product_id'].tolist()
    np.save("models/product_embeddings.npy", embeddings)
    np.save("models/product_ids.npy", product_ids)

    print("Product embeddings saved to 'models/product_embeddings.npy'.")
    print("Associated product IDs saved to 'models/product_ids.npy'.")

if __name__ == "__main__":
    main()
