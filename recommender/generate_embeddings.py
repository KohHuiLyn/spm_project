#!/usr/bin/env python
"""
generate_embeddings.py

This script fetches all products from the Supabase database and generates embeddings
for each product using the Sentence Transformer model. The embeddings are then saved
as numpy files in the models directory.
"""

import os
import sys
import numpy as np
from sentence_transformers import SentenceTransformer
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    print("Generating product embeddings...")
    
    # Get Supabase credentials
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        print("Error: Supabase credentials not found in environment variables.")
        print("Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.")
        sys.exit(1)
    
    try:
        # Connect to Supabase
        print("Connecting to Supabase...")
        supabase = create_client(supabase_url, supabase_key)
        
        # Fetch all products
        print("Fetching products from database...")
        response = supabase.table('products').select('*').execute()
        products = response.data
        
        if not products:
            print("No products found in the database.")
            sys.exit(1)
        
        print(f"Found {len(products)} products.")
        
        # Initialize the model
        print("Loading Sentence Transformer model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Prepare product texts for embedding
        product_ids = []
        product_texts = []
        
        for product in products:
            product_id = product.get('id')
            name = product.get('name', '')
            description = product.get('description', '')
            category = product.get('category', '')
            material = product.get('material', '')
            
            # Create a rich text representation of the product
            product_text = f"{name}. {description} Category: {category}. Material: {material}"
            
            product_ids.append(product_id)
            product_texts.append(product_text)
        
        # Generate embeddings for all products
        print("Generating embeddings for all products...")
        product_embeddings = model.encode(product_texts)
        
        # Save embeddings and IDs
        print("Saving embeddings to models/product_embeddings.npy...")
        os.makedirs('models', exist_ok=True)
        np.save('models/product_embeddings.npy', product_embeddings)
        np.save('models/product_ids.npy', np.array(product_ids))
        
        print("Successfully generated and saved product embeddings!")
        print(f"Saved embeddings for {len(product_ids)} products.")
        
    except Exception as e:
        print(f"Error generating embeddings: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 