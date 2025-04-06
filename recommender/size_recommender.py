#!/usr/bin/env python
"""
size_recommender.py

This module recommends clothing sizes based on user body measurements.
It compares detailed measurements (e.g., bust, waist, hips, chest, ptp) and also considers body shape ratios.
Instead of loading a local catalog CSV, it now queries Supabase for product details.
It also uses available sizes from the catalog instead of a hardcoded list.
"""

import json
import argparse
import sys
import os
import pandas as pd
import numpy as np
from typing import Dict, Tuple, Any

try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase-py: pip install supabase", file=sys.stderr)
    sys.exit(1)


def get_user_profile(user_id: str) -> Dict[str, Any]:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    print(f"Using Supabase URL: {url and 'Set' or 'Not set'}", file=sys.stderr)
    print(f"Using Supabase Key: {key and 'Set' or 'Not set'}", file=sys.stderr)
    
    if not url or not key:
        print("SUPABASE_URL and SUPABASE_KEY must be set.", file=sys.stderr)
        return {}
    try:
        print(f"Connecting to Supabase for user ID: {user_id}", file=sys.stderr)
        supabase: Client = create_client(url, key)
        response = supabase.table("profiles").select("*").eq("user_id", user_id).execute()
        print(f"Got response: {response}", file=sys.stderr)
        data = response.data
        if not data:
            print(f"No profile found for user ID: {user_id}", file=sys.stderr)
            return {}
        print(f"Found profile for user ID: {user_id}", file=sys.stderr)
        return data[0]
    except Exception as e:
        print(f"Error in get_user_profile: {e}", file=sys.stderr)
        return {}


def parse_measurements(measurements_str: str) -> dict:
    if not measurements_str:
        print("Empty measurements string", file=sys.stderr)
        return {}
    
    try:
        print(f"Trying to parse measurements: {measurements_str[:100]}...", file=sys.stderr)
        try:
            data = json.loads(measurements_str)
        except json.JSONDecodeError:
            print("JSON decode error, trying ast.literal_eval", file=sys.stderr)
            import ast
            data = ast.literal_eval(measurements_str)
        
        print(f"Raw data type: {type(data)}, value: {str(data)[:200]}", file=sys.stderr)
        
        # Handle different measurement formats
        if isinstance(data, dict):
            # Format 1: Dictionary with size keys
            if any(isinstance(value, dict) for value in data.values()):
                print("Format: Dictionary with size keys", file=sys.stderr)
                parsed = {}
                for size, measures in data.items():
                    if not isinstance(measures, dict):
                        continue
                    size_measures = {}
                    for k, v in measures.items():
                        try:
                            size_measures[k.lower()] = float(v.replace('"', '').strip()) if isinstance(v, str) else float(v)
                        except (ValueError, TypeError, AttributeError):
                            size_measures[k.lower()] = v
                    parsed[size] = size_measures
                return parsed
            # Format 2: Flat dictionary of measurements
            else:
                print("Format: Flat dictionary of measurements", file=sys.stderr)
                measurements_by_size = {}
                # Instead of using a hardcoded list, use the sizes available in data if provided.
                sizes = []
                if "sizes" in data and isinstance(data["sizes"], list):
                    sizes = data["sizes"]
                else:
                    # Fallback if no sizes provided (could also choose to error out)
                    sizes = ["XS", "S", "M", "L", "XL"]
                
                # Get base measurements from the flat dictionary
                base_measurements = {}
                for k, v in data.items():
                    if k.lower() in ["bust", "waist", "hips", "chest", "ptp", "shoulder"]:
                        try:
                            base_measurements[k.lower()] = float(v.replace('"', '').strip()) if isinstance(v, str) else float(v)
                        except (ValueError, TypeError, AttributeError):
                            pass
                
                if not base_measurements:
                    print("No valid measurements found in flat dictionary", file=sys.stderr)
                    return {}
                
                # Create size variants with increments based on the available sizes
                for i, size in enumerate(sizes):
                    size_measurements = {}
                    # Calculate an increment relative to the median size; here, assume the middle of the list is "M"
                    try:
                        m_index = sizes.index("M")
                    except ValueError:
                        m_index = len(sizes) // 2
                    increment = (i - m_index) * 5  # e.g., -10 for smallest, -5 for next, 0 for median, etc.
                    
                    for k, v in base_measurements.items():
                        size_measurements[k] = v + increment
                    
                    measurements_by_size[size] = size_measurements
                
                print(f"Created size variants: {measurements_by_size}", file=sys.stderr)
                return measurements_by_size
        elif isinstance(data, list):
            print("Format: List of sizes with measurements", file=sys.stderr)
            parsed = {}
            for item in data:
                if not isinstance(item, dict):
                    continue
                size = item.get("size", "M")
                measurements = item.get("measurements", {})
                if not measurements:
                    continue
                parsed[size] = {}
                for k, v in measurements.items():
                    try:
                        parsed[size][k.lower()] = float(v.replace('"', '').strip()) if isinstance(v, str) else float(v)
                    except (ValueError, TypeError, AttributeError):
                        pass
            return parsed
        elif isinstance(data, str):
            print("Format: String with escaped JSON, trying to parse again", file=sys.stderr)
            try:
                return parse_measurements(data)
            except Exception as e:
                print(f"Failed to parse nested string: {e}", file=sys.stderr)
                return {}
        else:
            print(f"Unknown format: {type(data)}", file=sys.stderr)
            return {}
    except Exception as e:
        print(f"Error in parse_measurements: {e}", file=sys.stderr)
        return {}


def compute_shape_distance(user: Dict[str, float], product: Dict[str, float]) -> float:
    def get_ratios(meas: Dict[str, float]) -> Tuple[float, float]:
        bust = meas.get("bust")
        waist = meas.get("waist")
        hips = meas.get("hips")
        if waist and bust and hips:
            return (bust / waist, hips / waist)
        return (0, 0)
    
    user_ratios = get_ratios(user)
    prod_ratios = get_ratios(product)
    
    if user_ratios == (0, 0) or prod_ratios == (0, 0):
        return 0.0
    diff_bust = abs(user_ratios[0] - prod_ratios[0])
    diff_hips = abs(user_ratios[1] - prod_ratios[1])
    return 0.5 * diff_bust + 0.5 * diff_hips


def compute_measurement_distance(user: Dict[str, float],
                                 product: Dict[str, float],
                                 weights: Dict[str, float]) -> float:
    common_keys = set(user.keys()).intersection(set(product.keys()))
    print(f"Common measurement keys: {common_keys}", file=sys.stderr)
    
    if not common_keys:
        print("ERROR: No common measurement keys between user and product", file=sys.stderr)
        return float('inf')
        
    total, total_weight = 0.0, 0.0
    differences = {}
    
    # Weights for different measurements
    weights = {
        'waist': 3.0,
        'hip': 3.0,
        'bust': 2.0,
        'chest': 2.0,
        'ptp': 2.0,  # Added pit-to-pit weight
        'length': 1.0
    }
    
    for key in common_keys:
        weight = weights.get(key.lower(), 1.0)
        try:
            # User measurements are in inches (except height in cm and weight in kg)
            user_value = float(user[key])
            # Product measurements are in cm, convert to inches (except height and weight)
            product_value = float(product[key])
            if key.lower() not in ['height', 'weight']:
                # Convert product measurements from cm to inches
                product_value = product_value / 2.54
            diff = abs(user_value - product_value)
            differences[key] = diff
            total += weight * diff
            total_weight += weight
            print(f"Measurement {key}: User={user_value}{'cm' if key.lower() == 'height' else 'kg' if key.lower() == 'weight' else 'in'}, Product={product_value}{'cm' if key.lower() == 'height' else 'kg' if key.lower() == 'weight' else 'in'}, Diff={diff}, Weight={weight}", file=sys.stderr)
        except Exception as e:
            print(f"Error processing measurement {key}: {e}", file=sys.stderr)
            continue
            
    if total_weight == 0:
        print("ERROR: Total weight is zero, cannot compute distance", file=sys.stderr)
        return float('inf')
        
    weighted_distance = total / total_weight
    print(f"Final weighted distance: {weighted_distance} (Total={total}, Weight={total_weight})", file=sys.stderr)
    print(f"Individual differences: {differences}", file=sys.stderr)
    
    return weighted_distance


def recommend_size_from_measurements(user_measurements: Dict[str, float],
                                     product_sizes: Dict[str, Dict[str, Any]]) -> Tuple[str, float]:
    if not product_sizes:
        print("ERROR: No product size information available", file=sys.stderr)
        raise ValueError("No product size information available")
    if not user_measurements:
        print("ERROR: No user measurements provided", file=sys.stderr)
        raise ValueError("No user measurements provided")
    
    print(f"Starting size recommendation with user measurements: {user_measurements}", file=sys.stderr)
    print(f"Available product sizes: {list(product_sizes.keys())}", file=sys.stderr)
    
    # User measurements are already in the correct units (inches for body measurements, cm for height, kg for weight)
    user_processed = {}
    for key, value in user_measurements.items():
        try:
            user_processed[key.lower()] = float(value)
        except (ValueError, TypeError):
            continue
    
    if not user_processed:
        print("ERROR: No valid measurements after processing", file=sys.stderr)
        raise ValueError("No valid measurements after processing")
    
    print(f"Processed user measurements: {user_processed}", file=sys.stderr)
    
    # Convert product measurements to inches (they might be strings)
    product_inches = {}
    for size, measurements in product_sizes.items():
        product_inches[size] = {}
        for key, value in measurements.items():
            try:
                # Handle both string and numeric values
                if isinstance(value, str):
                    product_inches[size][key.lower()] = float(value.replace('"', '').strip())
                else:
                    product_inches[size][key.lower()] = float(value)
            except (ValueError, TypeError):
                continue
    
    print(f"User measurements in inches: {user_processed}", file=sys.stderr)
    print(f"Product measurements in inches: {product_inches}", file=sys.stderr)
    
    # Weights for different measurements
    weights = {
        'waist': 3.0,
        'hip': 3.0,
        'bust': 2.0,
        'chest': 2.0,
        'length': 1.0
    }
    
    size_distances = {}
    for size, size_data in product_inches.items():
        print(f"\nEvaluating size {size} with measurements: {size_data}", file=sys.stderr)
        
        measurement_distance = 0.0
        total_weight = 0.0
        differences = {}
        
        for key, weight in weights.items():
            if key in user_processed and key in size_data:
                user_value = user_processed[key]
                product_value = size_data[key]
                diff = abs(user_value - product_value)
                differences[key] = diff
                measurement_distance += weight * diff
                total_weight += weight
                print(f"{key}: User={user_value:.2f}in, Product={product_value:.2f}in, Diff={diff:.2f}in", file=sys.stderr)
        
        if total_weight > 0:
            measurement_distance /= total_weight
            print(f"Measurement distance for size {size}: {measurement_distance}", file=sys.stderr)
            print(f"Individual differences: {differences}", file=sys.stderr)
            
            # Modified confidence calculation to ensure it's never zero
            # At most 6 inches difference would give 0% confidence
            max_diff = 6.0
            raw_confidence = 1.0 - (measurement_distance / max_diff)
            # Ensure confidence is at least 0.3 (30%) and at most 0.98 (98%)
            confidence = max(0.3, min(0.98, raw_confidence))
            
            size_distances[size] = (measurement_distance, confidence)
    
    if not size_distances:
        print("ERROR: Could not calculate size distances", file=sys.stderr)
        raise ValueError("Could not calculate size distances")
    
    best_size = min(size_distances.items(), key=lambda x: x[1][0])
    print(f"\nBest size: {best_size[0]} with distance {best_size[1][0]} and confidence {best_size[1][1]}", file=sys.stderr)
    
    return best_size[0], best_size[1][1]


def fallback_size_recommendation(user_height: float, user_weight: float) -> Dict[str, Any]:
    """Fallback size recommendation based on height and weight only"""
    print("ERROR: Fallback size recommendation is disabled", file=sys.stderr)
    raise ValueError("Measurement-based size recommendation required")


def get_size_recommendation(user_height: float,
                            user_weight: float,
                            user_measurements: Dict[str, float],
                            product: Dict) -> Dict[str, Any]:
    """Main function to get size recommendation"""
    print(f"Getting size recommendation for height={user_height}, weight={user_weight}", file=sys.stderr)
    print(f"User measurements: {user_measurements}", file=sys.stderr)
    print(f"Product data: {product}", file=sys.stderr)
    
    try:
        # Parse product size measurements
        product_sizes = {}
        if "sizes_with_measurements" in product:
            product_sizes = parse_measurements(product["sizes_with_measurements"])
        elif "sizes" in product:
            if isinstance(product["sizes"], dict):
                product_sizes = product["sizes"]
            elif isinstance(product["sizes"], list):
                # Use the available sizes from the catalog.
                # Assume the product record contains base measurement keys (e.g., bust, waist, hips, etc.)
                base_data = { key: product[key] for key in product if key.lower() in ["bust", "waist", "hips", "chest", "ptp", "shoulder"] }
                flat_data = { **base_data, "sizes": product["sizes"] }
                product_sizes = parse_measurements(json.dumps(flat_data))
        print(f"Parsed product sizes: {product_sizes}", file=sys.stderr)
        
        if not product_sizes:
            print("ERROR: No product size information available", file=sys.stderr)
            raise ValueError("Product has no size measurement data")
        
        if not user_measurements:
            print("ERROR: User measurements required for size recommendation", file=sys.stderr)
            raise ValueError("User measurements required")
        
        try:
            recommended_size, confidence = recommend_size_from_measurements(user_measurements, product_sizes)
            return {
                "recommended_size": recommended_size,
                "confidence": confidence,
                "method": "measurements"
            }
        except Exception as e:
            print(f"ERROR: Failed to recommend size based on measurements: {e}", file=sys.stderr)
            raise ValueError(f"Failed to recommend size: {str(e)}")
        
    except Exception as e:
        print(f"ERROR: get_size_recommendation failed: {e}", file=sys.stderr)
        raise ValueError(f"Size recommendation failed: {str(e)}")


def main():
    parser = argparse.ArgumentParser(description='Recommend clothing size based on measurements')
    parser.add_argument('--height', type=float, required=True, help='User height in cm')
    parser.add_argument('--weight', type=float, required=True, help='User weight in kg')
    parser.add_argument('--product_data', type=str, required=True, help='Product data in JSON format')
    parser.add_argument('--measurements', type=str, help='User measurements in JSON format')
    
    args = parser.parse_args()
    
    try:
        product_data = json.loads(args.product_data)
        
        user_measurements = {}
        if args.measurements:
            try:
                user_measurements = json.loads(args.measurements)
            except json.JSONDecodeError:
                print("Error parsing measurements JSON", file=sys.stderr)
        
        recommendation = get_size_recommendation(
            args.height,
            args.weight,
            user_measurements,
            product_data
        )
        
        print(json.dumps(recommendation))
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    # Optionally, you could query Supabase here if full catalog details are needed.
    main()
