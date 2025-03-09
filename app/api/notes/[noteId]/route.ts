import { NextRequest, NextResponse } from 'next/server';
import { getEditorContent } from '@/lib/services/editor-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const noteId = params.noteId;
    
    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }
    
    const { content, metadata } = await getEditorContent(noteId);
    
    return NextResponse.json({ content, metadata });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note content' },
      { status: 500 }
    );
  }
} 