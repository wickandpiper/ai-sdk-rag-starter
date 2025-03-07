import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || 'application/octet-stream';
    const fileName = request.headers.get('x-vercel-filename') || 'image.png';
    
    // Create a unique file name to prevent collisions
    const uniqueFileName = `uploads/${uuidv4()}-${fileName}`;
    const file = storage.file(uniqueFileName);
    
    // Get the file data
    const buffer = await request.arrayBuffer();
    
    // Upload the file to Firebase Storage
    await file.save(Buffer.from(buffer), {
      metadata: {
        contentType,
      },
    });
    
    // Make the file publicly accessible
    await file.makePublic();
    
    // Get the public URL
    const url = `https://storage.googleapis.com/${storage.name}/${uniqueFileName}`;
    
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
} 