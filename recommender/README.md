# Style Recommender Setup

This document explains how to use the style recommender system.

## Product Embeddings

The style recommender uses pre-computed product embeddings that are already included in the repository. You don't need to generate them unless you make significant changes to your product catalog.

The required embedding files are:
- `models/product_ids.npy`
- `models/product_embeddings.npy`

## When to Regenerate Embeddings

You only need to regenerate embeddings if:
1. You add new products to your database
2. You significantly change product descriptions
3. You want to use a different embedding model

If you need to regenerate embeddings, follow these steps:

### 1. Ensure Dependencies are Installed

Make sure your Python environment has the required packages:
```bash
pip install sentence-transformers supabase numpy
```

### 2. Generate New Embeddings

Run the Python script directly:
```bash
python recommender/generate_embeddings.py
```

This will:
1. Fetch all products from Supabase
2. Generate embeddings using SentenceTransformer
3. Save the embeddings to `models/product_embeddings.npy`
4. Save the product IDs to `models/product_ids.npy`

## How It Works

The style recommender system has two components:

1. **Pre-computed Embeddings**: These are vector representations of all products in the database, already generated and stored in the models directory.

2. **Recommendation Engine**: Uses these embeddings along with user preferences to recommend products that match the user's style (automatically runs when users visit the site).

## Personalized Recommendations

The system will:
1. Check if a user has a personalized model (based on their interactions)
2. Use that model if available, or fall back to a base model
3. Compare user preferences to product embeddings to find the best matches
4. Return personalized recommendations

## Troubleshooting

- If you're getting empty recommendations, check that your products in Supabase have meaningful descriptions, tags, and materials.
- Ensure the environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly set.
- If you've made changes to your product catalog, you may need to regenerate embeddings using the steps above. 