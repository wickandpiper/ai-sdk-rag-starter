import { NextRequest, NextResponse } from 'next/server';
import { getEditorContent } from '@/lib/services/editor-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const { noteId } = await params;
    
    console.log(`API: Fetching note with ID: ${noteId}`);
    
    if (!noteId) {
      console.error('API: Note ID is missing');
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }
    
    const { content, metadata } = await getEditorContent(noteId);
    
    console.log('API: Note fetched successfully', { 
      hasContent: !!content, 
      hasMetadata: !!metadata,
      metadataHasJsonContent: metadata && !!metadata.jsonContent
    });
    
    return NextResponse.json({ content, metadata });
  } catch (error) {
    console.error('API: Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note content: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 