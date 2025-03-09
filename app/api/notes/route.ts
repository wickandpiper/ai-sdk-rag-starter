import { NextRequest, NextResponse } from 'next/server';
import { getAllNotes } from '@/lib/services/editor-service';

export async function GET(req: NextRequest) {
  try {
    // Get page and pageSize from query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '5');
    
    // Fetch notes
    const notes = await getAllNotes(page, pageSize);
    
    return NextResponse.json(notes);
  } catch (error: any) {
    console.error('Error in notes API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notes' },
      { status: 500 }
    );
  }
} 