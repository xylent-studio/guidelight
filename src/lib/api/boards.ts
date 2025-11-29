import { supabase } from '../supabaseClient';
import type { Database } from '../../types/database';

// Use database types for boards and board_items
export type Board = Database['public']['Tables']['boards']['Row'];
export type BoardInsert = Database['public']['Tables']['boards']['Insert'];
export type BoardUpdate = Database['public']['Tables']['boards']['Update'];

export type BoardItem = Database['public']['Tables']['board_items']['Row'];
export type BoardItemInsert = Database['public']['Tables']['board_items']['Insert'];
export type BoardItemUpdate = Database['public']['Tables']['board_items']['Update'];

// Re-export Pick type for loadAutoboardPicks
import { getPublishedPicks, getPublishedPicksForBudtender } from './picks';
import type { Database as DB } from '../../types/database';
export type Pick = DB['public']['Tables']['picks']['Row'];

/**
 * Get all boards, optionally filtered by type
 */
export async function getBoards(type?: Board['type']): Promise<Board[]> {
  let query = supabase
    .from('boards')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true });
  
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching boards:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a single board by ID
 */
export async function getBoardById(boardId: string): Promise<Board | null> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single();
  
  if (error) {
    console.error('Error fetching board:', error);
    return null;
  }
  
  return data;
}

/**
 * Get board items for a board, ordered by sort_index
 */
export async function getBoardItems(boardId: string): Promise<BoardItem[]> {
  const { data, error } = await supabase
    .from('board_items')
    .select('*')
    .eq('board_id', boardId)
    .order('sort_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching board items:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get the auto_store board (house list)
 */
export async function getAutoStoreBoard(): Promise<Board | null> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('type', 'auto_store')
    .single();
  
  if (error) {
    console.error('Error fetching auto_store board:', error);
    return null;
  }
  
  return data;
}

/**
 * Get the auto_user board for a specific budtender
 */
export async function getAutoUserBoard(budtenderId: string): Promise<Board | null> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('type', 'auto_user')
    .eq('owner_user_id', budtenderId)
    .single();
  
  if (error) {
    console.error('Error fetching auto_user board:', error);
    return null;
  }
  
  return data;
}

// =============================================================
// CRITICAL FIX (Issue 4): Add removeBoardItem early
// This is needed by Session 05 for stale pick handling
// =============================================================

/**
 * Remove an item from a board
 */
export async function removeBoardItem(itemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('board_items')
    .delete()
    .eq('id', itemId);
  
  if (error) {
    console.error('Error removing board item:', error);
    return false;
  }
  
  return true;
}

// =============================================================
// CRITICAL FIX (Issue 5): Add auto board content loading functions
// These are needed by Session 05 to display auto board content
// They rely on getPublishedPicks from picks.ts (added in Session 02)
// =============================================================

/**
 * Load picks for auto boards (computed content)
 * Auto boards don't use board_items - their content is computed from picks
 */
export async function loadAutoboardPicks(board: Board): Promise<Pick[]> {
  if (board.type === 'auto_store') {
    // House list: all published picks from all staff
    return getPublishedPicks(50);
  }
  
  if (board.type === 'auto_user' && board.owner_user_id) {
    // Budtender's picks: their published picks only
    return getPublishedPicksForBudtender(board.owner_user_id);
  }
  
  // Custom boards don't use this function - they use board_items
  return [];
}

// =============================================================
// Session 06: Board drag-drop and editing API helpers
// =============================================================

/**
 * Update board items sort order.
 * 
 * NOTE: Only updates sort_index. position_x/position_y columns exist in DB
 * but are reserved for future freeform canvas layouts - not used in this implementation.
 */
export async function updateBoardItemsOrder(boardId: string, items: BoardItem[]): Promise<boolean> {
  // Update each item's sort_index individually
  // We use update() instead of upsert() to only change sort_index
  const promises = items.map((item, index) => 
    supabase
      .from('board_items')
      .update({ sort_index: index })
      .eq('id', item.id)
      .eq('board_id', boardId)
  );
  
  const results = await Promise.all(promises);
  const hasError = results.some(r => r.error);
  
  if (hasError) {
    console.error('Error updating board items order');
    return false;
  }
  
  return true;
}

/**
 * Update board metadata (name, status, description)
 */
export async function updateBoard(boardId: string, updates: BoardUpdate): Promise<Board | null> {
  const { data, error } = await supabase
    .from('boards')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', boardId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating board:', error);
    return null;
  }
  
  return data;
}

// =============================================================
// Session 07: Add pick to board
// =============================================================

export type AttributionStyle = 'prominent' | 'subtle' | null;

/**
 * Add a pick to a board with optional attribution.
 * Attribution is used when adding someone else's pick to your board.
 * - 'prominent': Shows "{Name}'s Pick" as a header
 * - 'subtle': Shows "From {Name}" as a footnote
 * - null: No attribution (own pick)
 */
export async function addPickToBoard(
  boardId: string, 
  pickId: string,
  attributionStyle: AttributionStyle = null
): Promise<BoardItem | null> {
  // Get max sort_index to append at end
  const { data: maxData } = await supabase
    .from('board_items')
    .select('sort_index')
    .eq('board_id', boardId)
    .order('sort_index', { ascending: false })
    .limit(1);
  
  const nextIndex = (maxData?.[0]?.sort_index ?? -1) + 1;
  
  const { data, error } = await supabase
    .from('board_items')
    .insert({
      board_id: boardId,
      type: 'pick',
      pick_id: pickId,
      attribution_style: attributionStyle,
      sort_index: nextIndex,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding pick to board:', error);
    return null;
  }
  
  return data;
}

// =============================================================
// Session 08: Board CRUD operations
// =============================================================

/**
 * Create a new custom board.
 */
export async function createBoard(
  name: string, 
  ownerId: string, 
  description?: string
): Promise<Board | null> {
  const { data, error } = await supabase
    .from('boards')
    .insert({
      name,
      type: 'custom',
      owner_user_id: ownerId,
      description: description || null,
      status: 'unpublished',
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating board:', error);
    return null;
  }
  
  return data;
}

/**
 * Delete a board (only custom boards can be deleted).
 * Returns true if deletion was successful.
 */
export async function deleteBoard(boardId: string): Promise<boolean> {
  // First verify it's a custom board
  const board = await getBoardById(boardId);
  if (!board || board.type !== 'custom') {
    console.error('Cannot delete non-custom board');
    return false;
  }
  
  // Delete board items first (cascade would work but explicit is clearer)
  await supabase
    .from('board_items')
    .delete()
    .eq('board_id', boardId);
  
  // Delete the board
  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId);
  
  if (error) {
    console.error('Error deleting board:', error);
    return false;
  }
  
  return true;
}

/**
 * Duplicate a board with all its items.
 */
export async function duplicateBoard(
  boardId: string, 
  newName: string, 
  ownerId: string
): Promise<Board | null> {
  // Get original board
  const originalBoard = await getBoardById(boardId);
  if (!originalBoard) return null;
  
  // Create new board
  const newBoard = await createBoard(
    newName, 
    ownerId, 
    originalBoard.description || undefined
  );
  if (!newBoard) return null;
  
  // Copy items
  const items = await getBoardItems(boardId);
  if (items.length > 0) {
    const newItems = items.map(item => ({
      board_id: newBoard.id,
      type: item.type,
      pick_id: item.pick_id,
      text_content: item.text_content,
      text_variant: item.text_variant,
      attribution_style: item.attribution_style,
      sort_index: item.sort_index,
    }));
    
    await supabase.from('board_items').insert(newItems);
  }
  
  return newBoard;
}

/**
 * Add a text block to a board.
 */
export async function addTextToBoard(
  boardId: string, 
  content: string, 
  variant: 'heading' | 'body' = 'body'
): Promise<BoardItem | null> {
  // Get max sort_index
  const { data: maxData } = await supabase
    .from('board_items')
    .select('sort_index')
    .eq('board_id', boardId)
    .order('sort_index', { ascending: false })
    .limit(1);
  
  const nextIndex = (maxData?.[0]?.sort_index ?? -1) + 1;
  
  const { data, error } = await supabase
    .from('board_items')
    .insert({
      board_id: boardId,
      type: 'text',
      text_content: content,
      text_variant: variant,
      sort_index: nextIndex,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding text to board:', error);
    return null;
  }
  
  return data;
}

/**
 * Update a text block's content.
 */
export async function updateTextBlock(itemId: string, content: string): Promise<boolean> {
  const { error } = await supabase
    .from('board_items')
    .update({ text_content: content })
    .eq('id', itemId);
  
  if (error) {
    console.error('Error updating text block:', error);
    return false;
  }
  
  return true;
}

/**
 * Add an image to a board.
 */
export async function addImageToBoard(boardId: string, assetId: string): Promise<BoardItem | null> {
  // Get max sort_index
  const { data: maxData } = await supabase
    .from('board_items')
    .select('sort_index')
    .eq('board_id', boardId)
    .order('sort_index', { ascending: false })
    .limit(1);
  
  const nextIndex = (maxData?.[0]?.sort_index ?? -1) + 1;
  
  const { data, error } = await supabase
    .from('board_items')
    .insert({
      board_id: boardId,
      type: 'image',
      asset_id: assetId,
      sort_index: nextIndex,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding image to board:', error);
    return null;
  }
  
  return data;
}

