import { supabase } from '../supabaseClient';
import type { Database } from '@/types/database';

export type MediaAsset = Database['public']['Tables']['media_assets']['Row'];
export type MediaAssetInsert = Database['public']['Tables']['media_assets']['Insert'];

export type AssetKind = 'logo' | 'clipart' | 'background' | 'photo' | 'product';

/**
 * Upload a file to storage and create media_assets record
 */
export async function uploadAsset(
  file: File,
  kind: AssetKind,
  uploaderId: string,
  label?: string,
  tags?: string[]
): Promise<MediaAsset | null> {
  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${kind}/${filename}`;
  
  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
    });
  
  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(path);
  
  // Get image dimensions if it's an image
  let width: number | undefined;
  let height: number | undefined;
  
  if (file.type.startsWith('image/')) {
    const dimensions = await getImageDimensions(file);
    width = dimensions.width;
    height = dimensions.height;
  }
  
  // Create media_assets record
  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      url: urlData.publicUrl,
      filename: file.name,
      file_size: file.size,
      mime_type: file.type,
      kind,
      label: label || file.name.replace(/\.[^/.]+$/, ''),
      tags,
      uploaded_by: uploaderId,
      width,
      height,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating asset record:', error);
    // Try to clean up uploaded file
    await supabase.storage.from('media').remove([path]);
    return null;
  }
  
  return data;
}

/**
 * Get image dimensions from File
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get all assets, optionally filtered by kind
 */
export async function getAssets(kind?: AssetKind, limit = 50): Promise<MediaAsset[]> {
  let query = supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (kind) {
    query = query.eq('kind', kind);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Search assets by label or tags
 */
export async function searchAssets(query: string, kind?: AssetKind): Promise<MediaAsset[]> {
  // Build the search query - search in label (ilike) and check if query is in tags array
  let dbQuery = supabase
    .from('media_assets')
    .select('*')
    .or(`label.ilike.%${query}%,tags.cs.{${query}}`)
    .order('created_at', { ascending: false })
    .limit(30);
  
  if (kind) {
    dbQuery = dbQuery.eq('kind', kind);
  }
  
  const { data, error } = await dbQuery;
  
  if (error) {
    console.error('Error searching assets:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a single asset by ID
 */
export async function getAssetById(assetId: string): Promise<MediaAsset | null> {
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', assetId)
    .single();
  
  if (error) {
    console.error('Error fetching asset:', error);
    return null;
  }
  
  return data;
}

/**
 * Delete an asset (removes file from storage and record from DB)
 */
export async function deleteAsset(assetId: string): Promise<boolean> {
  // Get asset to find file path
  const asset = await getAssetById(assetId);
  if (!asset) return false;
  
  // Extract path from URL - handle different URL formats
  try {
    const url = new URL(asset.url);
    const pathParts = url.pathname.split('/storage/v1/object/public/media/');
    const path = pathParts.length > 1 ? pathParts[1] : null;
    
    // Delete from storage if we found a path
    if (path) {
      await supabase.storage.from('media').remove([path]);
    }
  } catch (e) {
    console.warn('Could not parse asset URL for storage deletion:', e);
  }
  
  // Delete record
  const { error } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', assetId);
  
  if (error) {
    console.error('Error deleting asset:', error);
    return false;
  }
  
  return true;
}

/**
 * Update asset metadata (label, tags)
 */
export async function updateAsset(
  assetId: string, 
  updates: { label?: string; tags?: string[] }
): Promise<MediaAsset | null> {
  const { data, error } = await supabase
    .from('media_assets')
    .update(updates)
    .eq('id', assetId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating asset:', error);
    return null;
  }
  
  return data;
}

/**
 * Get assets by IDs
 */
export async function getAssetsByIds(assetIds: string[]): Promise<MediaAsset[]> {
  if (assetIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .in('id', assetIds);
  
  if (error) {
    console.error('Error fetching assets by IDs:', error);
    return [];
  }
  
  return data || [];
}

