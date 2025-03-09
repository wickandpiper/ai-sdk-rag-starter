import { NextRequest, NextResponse } from 'next/server';
import { saveEditorContent } from '@/lib/services/editor-service';
import { JSONContent } from 'novel';

export async function POST(req: NextRequest) {
  try {
    const { jsonContent, htmlContent, markdownContent, wordCount, resourceId, title } = await req.json();
    
    if (!jsonContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const savedResourceId = await saveEditorContent(
      jsonContent as JSONContent,
      htmlContent as string,
      markdownContent as string,
      wordCount as number,
      resourceId as string,
      title as string || "Untitled Note"
    );
    
    return NextResponse.json({ resourceId: savedResourceId });
  } catch (error: any) {
    console.error('Error in editor API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save editor content' },
      { status: 500 }
    );
  }
} 