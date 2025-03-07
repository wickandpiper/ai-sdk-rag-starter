import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

// This is a serverless function, not an Edge function
export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
    }
    
    // Fetch the image from the provided URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image from URL' }, { status: 500 });
    }
    
    // Get the image data as ArrayBuffer
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    
    // Create a unique file name
    const fileName = `ai-image-${Date.now()}.png`;
    const uniqueFileName = `uploads/${uuidv4()}-${fileName}`;
    
    // Upload to Firebase Storage
    const file = storage.file(uniqueFileName);
    
    // Upload the file to Firebase Storage
    await file.save(Buffer.from(imageArrayBuffer), {
      metadata: {
        contentType: 'image/png',
      },
    });
    
    // Make the file publicly accessible
    await file.makePublic();
    
    // Get the public URL
    const firebaseUrl = `https://storage.googleapis.com/${storage.name}/${uniqueFileName}`;
    
    // Return the Firebase Storage URL
    return NextResponse.json({ 
      url: firebaseUrl,
      originalUrl: imageUrl 
    }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    return NextResponse.json({ 
      error: 'Failed to upload image to Firebase',
      originalUrl: (error as any)?.imageUrl || null
    }, { status: 500 });
  }
} 