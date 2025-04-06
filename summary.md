# Style Recommender Guide

## Pre-computed Embeddings

The style recommender comes with pre-computed embeddings for all products. These files are already included in the repository:
- `models/product_ids.npy`
- `models/product_embeddings.npy`

You don't need to generate them unless you make significant changes to your product catalog.

## Running the Application

```bash
npm run dev
```

## How It Works

The style recommender uses pre-computed embeddings to provide personalized recommendations. It:

1. Uses the existing embeddings to compare with user preferences
2. Provides personalized recommendations based on style preferences
3. Continues improving as users interact with products

For more details, see `recommender/README.md`
