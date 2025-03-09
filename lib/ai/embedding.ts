import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db, waitForDbInit } from '../db';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { embeddings } from '../db/schema/embeddings';

// Make sure the OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set in environment variables');
}

// Create a fallback embedding model that returns zero vectors
const fallbackEmbedding = async (text: string): Promise<number[]> => {
  console.warn('Using fallback embedding model (zero vector) due to missing API key');
  return Array(1536).fill(0);
};

// Use the real model if API key is available, otherwise use fallback
const embeddingModel = process.env.OPENAI_API_KEY 
  ? openai.embedding('text-embedding-ada-002')
  : null; // We'll handle this in the functions below

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '');
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  
  // If no API key, use fallback
  if (!embeddingModel) {
    return Promise.all(
      chunks.map(async (chunk) => ({
        content: chunk,
        embedding: await fallbackEmbedding(chunk)
      }))
    );
  }
  
  // Otherwise use the real model
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  try {
    const inputText = value.replaceAll('\\n', ' ');
    
    // If no API key, use fallback directly
    if (!embeddingModel) {
      return fallbackEmbedding(inputText);
    }
    
    const { embedding } = await embed({
      model: embeddingModel,
      value: inputText,
    });
    return embedding;
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    
    // Return a fallback empty embedding if there's an error
    if (error.message?.includes('API key')) {
      console.error('OpenAI API key is missing or invalid. Please check your environment variables.');
      return fallbackEmbedding(value.replaceAll('\\n', ' '));
    }
    
    // For other errors, rethrow
    throw error;
  }
};

export const findRelevantContent = async (userQuery: string) => {
  try {
    // Wait for database initialization
    const dbClient = await waitForDbInit();
    
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const formattedEmbedding = JSON.stringify(userQueryEmbedded);
    
    // For now, use raw SQL for the vector similarity search
    // since Drizzle ORM doesn't have built-in support for it
    const query = {
      text: `
        SELECT 
          content,
          1 - (embedding <=> $1::vector) as similarity
        FROM 
          embeddings
        WHERE 
          1 - (embedding <=> $1::vector) > 0.5
        ORDER BY 
          similarity DESC
        LIMIT 4
      `,
      values: [`[${userQueryEmbedded.join(',')}]`]
    };
    
    const results = await dbClient.execute(query);
    
    return results.map((row: any) => ({
      name: row.content,
      similarity: row.similarity,
    }));
  } catch (error) {
    console.error('Error finding relevant content:', error);
    return [];
  }
};