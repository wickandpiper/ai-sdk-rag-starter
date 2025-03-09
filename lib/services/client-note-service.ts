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
    console.log(`Fetching note content for ID: ${noteId}`);
    const response = await fetch(`/api/notes/${noteId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
      console.error('API error response:', errorData);
      throw new Error(errorData.error || `Failed to fetch note content: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Note content fetched successfully:', { 
      hasContent: !!data.content, 
      hasMetadata: !!data.metadata,
      metadataHasJsonContent: data.metadata && !!data.metadata.jsonContent,
      contentType: data.content ? typeof data.content : 'undefined',
      contentLength: data.content ? data.content.length : 0
    });
    
    // If we have metadata but no jsonContent, log a warning
    if (data.metadata && !data.metadata.jsonContent) {
      console.warn('Note metadata found but missing jsonContent property:', {
        noteId,
        metadataKeys: Object.keys(data.metadata)
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching note content:', error);
    toast.error('Failed to load note content: ' + (error instanceof Error ? error.message : String(error)));
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