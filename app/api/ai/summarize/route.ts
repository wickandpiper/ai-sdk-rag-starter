import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI client if API key is available
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Cache for recently generated titles to avoid redundant API calls
const titleCache = new Map<string, { title: string, summary: string, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const CONTENT_HASH_LENGTH = 100; // Length of content to use for hashing

export async function POST(req: NextRequest) {
  try {
    const { content, maxLength = 50 } = await req.json();
    
    if (!content || content.length < 200) {
      return NextResponse.json(
        { error: 'Content is too short to summarize' },
        { status: 400 }
      );
    }
    
    // Create a simple hash of the content for caching
    const contentHash = content.slice(0, CONTENT_HASH_LENGTH) + content.length.toString();
    
    // Check cache first
    const cachedResult = titleCache.get(contentHash);
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_TTL) {
      console.log('Using cached title');
      return NextResponse.json({
        title: cachedResult.title,
        summary: cachedResult.summary,
        cached: true
      });
    }
    
    // If OpenAI is not configured or you want to use a different AI provider
    if (!openai) {
      console.warn('OpenAI API key not configured, using fallback title generation');
      const result = generateFallbackTitle(content);
      
      // Cache the result
      titleCache.set(contentHash, {
        ...result,
        timestamp: Date.now()
      });
      
      return NextResponse.json(result);
    }
    
    try {
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates concise titles and summaries.' },
          { role: 'user', content: createPrompt(content, maxLength) }
        ],
        temperature: 0.7,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      });
      
      // Parse the response
      const responseText = response.choices[0]?.message?.content || '';
      let result;
      
      try {
        result = JSON.parse(responseText);
        const finalResult = {
          title: result.title || 'Untitled Note',
          summary: result.summary || ''
        };
        
        // Cache the result
        titleCache.set(contentHash, {
          ...finalResult,
          timestamp: Date.now()
        });
        
        return NextResponse.json(finalResult);
      } catch (e) {
        console.error('Error parsing OpenAI response:', e);
        return generateFallbackTitle(content);
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return generateFallbackTitle(content);
    }
  } catch (error: any) {
    console.error('Error generating title:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate title' },
      { status: 500 }
    );
  }
}

// Helper function to create the prompt
function createPrompt(content: string, maxLength: number): string {
  // Extract a representative sample of the content
  const contentSample = extractRepresentativeSample(content, 1500);
  
  return `
    You are an AI assistant that helps generate concise, descriptive titles for notes.
    
    Here is the content of a note:
    ---
    ${contentSample}
    ---
    
    Please generate:
    1. A concise, descriptive title (maximum ${maxLength} characters)
    2. A brief summary of the content (maximum 150 characters)
    
    Format your response as JSON with "title" and "summary" fields.
  `;
}

// Extract a representative sample of the content
function extractRepresentativeSample(content: string, maxLength: number): string {
  if (content.length <= maxLength) {
    return content;
  }
  
  // Take the beginning, middle, and end of the content
  const thirdLength = Math.floor(maxLength / 3);
  const beginning = content.slice(0, thirdLength);
  const middle = content.slice(Math.floor(content.length / 2) - thirdLength / 2, Math.floor(content.length / 2) + thirdLength / 2);
  const end = content.slice(content.length - thirdLength);
  
  return `${beginning}... ${middle}... ${end}`;
}

// Fallback title generation without AI
function generateFallbackTitle(content: string) {
  // Extract first few words for the title
  const words = content.split(/\s+/).slice(0, 5).join(' ');
  
  // Create a simple summary
  const summary = content.slice(0, 100) + (content.length > 100 ? '...' : '');
  
  return { 
    title: words.length > 0 ? `${words}...` : 'Untitled Note',
    summary
  };
} 