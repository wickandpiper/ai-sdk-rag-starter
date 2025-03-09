/**
 * Client-side service for fetching note content through the API
 * This avoids direct database access from the client
 */

import { toast } from 'sonner';

/**
 * Fetches note content from the API
 */
export const fetchNoteContent = async (noteId: string) => {
  try {
    const response = await fetch(`/api/notes/${noteId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch note content');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching note content:', error);
    toast.error('Failed to load note content');
    throw error;
  }
};

/**
 * Fetches just the note metadata (title, etc.) from the API
 */
export const fetchNoteMetadata = async (noteId: string) => {
  try {
    const { metadata } = await fetchNoteContent(noteId);
    return metadata;
  } catch (error) {
    console.error('Error fetching note metadata:', error);
    throw error;
  }
}; 