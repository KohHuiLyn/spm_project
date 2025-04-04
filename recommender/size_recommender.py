#!/usr/bin/env python
"""
size_recommender.py

This module defines the function `recommend_size` which, given a product ID and a user's body measurements,
parses the product's available sizes (from a JSON field) and returns the recommended size.
"""

import pandas as pd
import numpy as np
import json
import argparse
from typing import Tuple, Dict
import sys

def parse_measurements(measurements_str: str) -> dict:
    """
    Parse a JSON or Python dict string of size measurements.
    First tries to use json.loads; if that fails, it falls back to ast.literal_eval.
    """
    try:
        # Attempt to parse as JSON
        data = json.loads(measurements_str)
    except Exception as e:
        print("JSON error, trying literal_eval:", e)
        try:
            # Use ast.literal_eval for a more lenient parsing of dict literals
            data = ast.literal_eval(measurements_str)
        except Exception as e2:
            print("Error parsing measurements with literal_eval:", e2)
            return {}
    try:
        parsed = {size: {k: float(v) for k, v in measures.items()} for size, measures in data.items()}
        return parsed
    except Exception as e:
        print("Error processing measurements:", e)
        return {}


def recommend_size(user_measurements: dict, product_id: str, catalog_path: str) -> dict:
    """
    Recommend a size for a given product based on user measurements.
    
    Parameters:
        user_measurements (dict): e.g., {"bust": 90, "waist": 70, "hips": 95}
        product_id (str): The ID of the product to get a size recommendation for.
        catalog_path (str): Path to the product catalog CSV.
    
    Returns:
        dict: {"recommended_size": "M"} (simplified output).
    """
    df = pd.read_csv(catalog_path)
    
    # Find the product by product_id
    product_row = df[df["product_id"] == product_id]
    if product_row.empty:
        return {"error": f"Product with id {product_id} not found."}
    
    product_row = product_row.iloc[0]
    
    sizes_str = product_row.get("sizes_with_measurements", "")
    if not sizes_str:
        return {"error": "No size measurements available for this product."}
    
    available_sizes = parse_measurements(sizes_str)
    if not available_sizes:
        return {"error": "Could not parse size measurements."}
    
    user_vector = np.array([
        float(user_measurements.get("bust", 0)),
        float(user_measurements.get("waist", 0)),
        float(user_measurements.get("hips", 0))
    ])
    
    best_size = None
    best_distance = None
    for size, meas in available_sizes.items():
        size_vector = np.array([
            meas.get("bust", 0),
            meas.get("waist", 0),
            meas.get("hips", 0)
        ], dtype=float)
        distance = np.linalg.norm(user_vector - size_vector)
        if best_distance is None or distance < best_distance:
            best_distance = distance
            best_size = size
    
    if best_size is None:
        return {"error": "Could not determine the best size."}
    
    return {"recommended_size": best_size}

def get_size_recommendation(user_height: float, user_weight: float, product: Dict) -> Tuple[str, float]:
    """
    Get size recommendation based on user height and weight.
    
    Args:
        user_height: User's height in cm
        user_weight: User's weight in kg
        product: Product data dictionary
        
    Returns:
        tuple: (recommended_size, confidence)
    """
    # Define size ranges - these should be adjusted based on your actual data
    size_mapping = {
        'XS': {'height': (150, 160), 'weight': (40, 50)},
        'S': {'height': (155, 165), 'weight': (45, 58)},
        'M': {'height': (160, 175), 'weight': (53, 70)},
        'L': {'height': (170, 185), 'weight': (65, 85)},
        'XL': {'height': (180, 195), 'weight': (80, 100)},
        'XXL': {'height': (190, 210), 'weight': (95, 130)}
    }
    
    # Calculate size scores based on how well the user fits into each size range
    size_scores = {}
    for size, ranges in size_mapping.items():
        # Height score - how close is the user to the center of this size's height range
        height_min, height_max = ranges['height']
        height_center = (height_min + height_max) / 2
        height_score = 1 - min(abs(user_height - height_center) / (height_max - height_min), 1)
        
        # Weight score - how close is the user to the center of this size's weight range
        weight_min, weight_max = ranges['weight']
        weight_center = (weight_min + weight_max) / 2
        weight_score = 1 - min(abs(user_weight - weight_center) / (weight_max - weight_min), 1)
        
        # Combined score (weight height and weight equally)
        size_scores[size] = (height_score + weight_score) / 2
    
    # Get the size with the highest score
    recommended_size = max(size_scores.items(), key=lambda x: x[1])
    
    return recommended_size[0], recommended_size[1]

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Get size recommendation')
    parser.add_argument('--height', type=float, required=True, help='User height in cm')
    parser.add_argument('--weight', type=float, required=True, help='User weight in kg')
    parser.add_argument('--product_data', type=str, required=True, help='Product data as JSON string')
    
    args = parser.parse_args()
    
    try:
        product_data = json.loads(args.product_data)
        size, confidence = get_size_recommendation(args.height, args.weight, product_data)
        
        result = {
            'recommended_size': size,
            'confidence': float(confidence),
            'product_id': product_data.get('product_id', ''),
            'product_name': product_data.get('name', '')
        }
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)
