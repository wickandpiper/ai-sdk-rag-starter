import { NextRequest, NextResponse } from 'next/server';
import { db, waitForDbInit } from '@/lib/db';
import { resources } from '@/lib/db/schema/resources';
import { eq } from 'drizzle-orm';

// Track the last update time for each note to prevent excessive updates
const lastUpdateTimes = new Map<string, number>();
const MIN_UPDATE_INTERVAL = 2000; // 2 seconds minimum between updates

export async function POST(req: NextRequest) {
  try {
    const { noteId, title } = await req.json();
    
    if (!noteId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: noteId and title are required' },
        { status: 400 }
      );
    }
    
    // Check if we've updated this note recently
    const now = Date.now();
    const lastUpdate = lastUpdateTimes.get(noteId) || 0;
    
    if (now - lastUpdate < MIN_UPDATE_INTERVAL) {
      // Too soon since last update, return success without doing anything
      // This prevents excessive database operations
      return NextResponse.json({ 
        success: true, 
        noteId, 
        title,
        throttled: true 
      });
    }
    
    // Update the last update time
    lastUpdateTimes.set(noteId, now);
    
    // Wait for database initialization
    const dbClient = await waitForDbInit();
    
    // First, get the current content
    const result = await dbClient.execute({
      text: `
        SELECT content
        FROM resources
        WHERE id = $1
        LIMIT 1
      `,
      values: [noteId]
    });
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    // Parse the content
    let contentObj;
    try {
      contentObj = JSON.parse(result[0].content);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid note content format' },
        { status: 500 }
      );
    }
    
    // Only update if the title has actually changed
    if (contentObj.title === title) {
      return NextResponse.json({ 
        success: true, 
        noteId, 
        title,
        unchanged: true 
      });
    }
    
    // Update the title
    contentObj.title = title;
    
    // Save back to the database
    await dbClient.execute({
      text: `
        UPDATE resources
        SET content = $1
        WHERE id = $2
      `,
      values: [JSON.stringify(contentObj), noteId]
    });
    
    return NextResponse.json({ success: true, noteId, title });
  } catch (error: any) {
    console.error('Error updating note title:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update note title' },
      { status: 500 }
    );
  }
} 