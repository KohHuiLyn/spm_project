import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function sortSizes(sizes: string[]): string[] {
  const sizeOrder = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  return sizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b))
}

export function parseColours(colourString: string): string[] {
  if (!colourString) return []
  const normalized = colourString.replace(/\s+and\s+/gi, ', ')
  return normalized.split(',').map(c => c.trim())
}
export const colorNameToHex: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  blue: '#0000ff',
  green: '#008000',
  khaki: '#f0e68c',
  natural: '#f5f5dc',
  persianrose: '#ff00af',
  darkwash: '#2f4f4f',
  lightoak: '#d2b48c',
  heathergrey: '#b6b6b4',
  fern: '#4f7942',
  soil: '#7c482b',
  souffle: '#fce5cd',
  midnight: '#191970',
  umber: '#635147',
  eggnog: '#faf3dd',
  midwash: '#708090',
}

