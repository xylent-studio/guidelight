import { supabase } from '../supabaseClient';
import type { Database } from '@/types/database';

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type Category = Database['public']['Tables']['categories']['Row'];

// Cache for category lookups (populated on first use)
let categoryCache: Category[] | null = null;

/**
 * Get all categories (with caching for performance)
 */
async function getCategoriesForMapping(): Promise<Category[]> {
  if (categoryCache) return categoryCache;
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  categoryCache = data || [];
  return categoryCache;
}

/**
 * Map a category name string to category_id
 * Used for API sync when external systems send category as string
 * Returns null if no match found
 */
export async function getCategoryIdByName(categoryName: string): Promise<string | null> {
  const categories = await getCategoriesForMapping();
  
  // Try exact match first
  const exact = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
  if (exact) return exact.id;
  
  // Try partial match (e.g., "Pre-Roll" matches "Pre-rolls")
  const partial = categories.find(c => 
    c.name.toLowerCase().includes(categoryName.toLowerCase()) ||
    categoryName.toLowerCase().includes(c.name.toLowerCase())
  );
  if (partial) return partial.id;
  
  return null;
}

/**
 * Get all active products
 */
export async function getProducts(limit = 100): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get products with category joined
 * Uses manual join due to FK naming
 */
export async function getProductsWithCategory(limit = 100): Promise<(Product & { category?: Category | null })[]> {
  // Get products first
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching products with category:', error);
    return [];
  }
  
  if (!products?.length) return [];
  
  // Get categories and join manually
  const categories = await getCategoriesForMapping();
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  
  return products.map(p => ({
    ...p,
    category: p.category_id ? categoryMap.get(p.category_id) || null : null
  }));
}

/**
 * Search products by name, brand, or strain
 */
export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%,strain_name.ilike.%${query}%`)
    .order('name', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error searching products:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get products by category_id
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get products by category name (convenience wrapper)
 */
export async function getProductsByCategoryName(categoryName: string): Promise<Product[]> {
  const categoryId = await getCategoryIdByName(categoryName);
  if (!categoryId) {
    console.warn(`Category not found: ${categoryName}`);
    return [];
  }
  return getProductsByCategory(categoryId);
}

/**
 * Get products in stock only
 */
export async function getInStockProducts(limit = 50): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('in_stock', true)
    .order('name', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching in-stock products:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a single product by ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  
  return data;
}

/**
 * Get a product by source system ID (for API sync)
 */
export async function getProductBySourceId(source: string, sourceId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('source', source)
    .eq('source_id', sourceId)
    .single();
  
  if (error && error.code !== 'PGRST116') {  // Ignore "no rows" error
    console.error('Error fetching product by source ID:', error);
  }
  
  return data || null;
}

/**
 * Create a new product
 */
export async function createProduct(product: ProductInsert): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating product:', error);
    return null;
  }
  
  return data;
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, updates: ProductUpdate): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating product:', error);
    return null;
  }
  
  return data;
}

/**
 * Upsert a product (for API sync - insert or update by source/source_id)
 * Note: Requires source and source_id to be set for the upsert to work correctly
 */
export async function upsertProduct(product: ProductInsert): Promise<Product | null> {
  // For upsert by source+source_id, we need to handle it manually
  // since the unique constraint is partial (WHERE source_id IS NOT NULL)
  if (product.source && product.source_id) {
    const existing = await getProductBySourceId(product.source, product.source_id);
    if (existing) {
      // Update existing
      return updateProduct(existing.id, {
        ...product,
        last_synced_at: new Date().toISOString(),
      });
    }
  }
  
  // Insert new with sync timestamp
  return createProduct({
    ...product,
    last_synced_at: product.source !== 'manual' ? new Date().toISOString() : undefined,
  });
}

/**
 * Soft delete a product (set is_active = false)
 */
export async function deleteProduct(productId: string): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', productId);
  
  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }
  
  return true;
}

/**
 * Get product image URL (handles asset vs URL priority)
 * Custom uploaded asset takes priority over API-provided URL
 */
export function getProductImageUrl(product: Product): string | null {
  // Custom uploaded asset takes priority
  // Note: When using this function, ensure you join media_assets if you need the actual URL
  // This function returns the API URL as fallback
  if (product.image_asset_id) {
    // Caller should have loaded the asset URL via a join
    // Return null to indicate they need to look up the asset
    return null;
  }
  
  // Fall back to API-provided URL
  return product.image_url;
}

/**
 * Get products with their image assets joined
 * Uses manual join due to FK naming
 */
export async function getProductsWithImages(limit = 100): Promise<(Product & { image_asset?: { url: string } | null })[]> {
  // Get products first
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching products with images:', error);
    return [];
  }
  
  if (!products?.length) return [];
  
  // Collect asset IDs and fetch them
  const assetIds = products
    .map(p => p.image_asset_id)
    .filter((id): id is string => id !== null);
  
  if (assetIds.length === 0) {
    return products.map(p => ({ ...p, image_asset: null }));
  }
  
  const { data: assets } = await supabase
    .from('media_assets')
    .select('id, url')
    .in('id', assetIds);
  
  const assetMap = new Map(assets?.map(a => [a.id, { url: a.url }]) || []);
  
  return products.map(p => ({
    ...p,
    image_asset: p.image_asset_id ? assetMap.get(p.image_asset_id) || null : null
  }));
}

/**
 * Clear the category cache (call after category changes)
 */
export function clearCategoryCache(): void {
  categoryCache = null;
}
