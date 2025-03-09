import { db, waitForDbInit } from '@/lib/db';
import { resources, EditorMetadata, ImageMetadata } from '@/lib/db/schema/resources';
import { embeddings } from '@/lib/db/schema/embeddings';
import { generateEmbedding } from '@/lib/ai/embedding';
import { nanoid } from '@/lib/utils';
import { JSONContent } from 'novel';
import { eq, and, sql, desc } from 'drizzle-orm';

/**
 * Extracts text content from JSON editor content
 */
const extractTextFromJSON = (json: JSONContent): string => {
  let text = '';
  
  // Extract text from the current node
  if (json.type === 'text' && json.text) {
    text += json.text + ' ';
  }
  
  // Recursively extract text from child nodes
  if (json.content && Array.isArray(json.content)) {
    json.content.forEach(node => {
      text += extractTextFromJSON(node);
    });
  }
  
  return text;
};

/**
 * Extracts images from JSON editor content
 */
const extractImagesFromJSON = (json: JSONContent): ImageMetadata[] => {
  const images: ImageMetadata[] = [];
  
  // Check if current node is an image
  if (json.type === 'image' && json.attrs) {
    const { src, alt, width, height } = json.attrs;
    if (src) {
      images.push({
        src,
        alt,
        width,
        height,
        mimeType: src.startsWith('data:') ? src.split(';')[0].split(':')[1] : undefined
      });
    }
  }
  
  // Recursively extract images from child nodes
  if (json.content && Array.isArray(json.content)) {
    json.content.forEach(node => {
      images.push(...extractImagesFromJSON(node));
    });
  }
  
  return images;
};

/**
 * Helper function to format embedding array for PostgreSQL vector type
 */
const formatEmbedding = (embedding: number[]): string => {
  return `[${embedding.join(',')}]`;
};

/**
 * Saves editor content to the database
 * If resourceId is provided, it will update that resource instead of creating a new one
 */
export const saveEditorContent = async (
  jsonContent: JSONContent,
  htmlContent: string,
  markdownContent: string,
  wordCount: number,
  existingResourceId?: string,
  title: string = "Untitled Note"
): Promise<string> => {
  try {
    // Wait for database initialization
    const dbClient = await waitForDbInit();
    
    // Extract text content for embedding
    const textContent = extractTextFromJSON(jsonContent);
    
    // Extract images
    const images = extractImagesFromJSON(jsonContent);
    
    // Create metadata
    const editorData = {
      title,
      wordCount,
      htmlContent,
      markdownContent,
      jsonContent,
      images
    };
    
    // Convert to JSON string to store in content field
    const contentJson = JSON.stringify(editorData);
    
    // Generate embedding for the main content
    const embedding = await generateEmbedding(textContent);
    const formattedEmbedding = `[${embedding.join(',')}]`;
    
    let resourceId = existingResourceId;
    
    if (resourceId) {
      // Update existing resource
      await dbClient.execute({
        text: `
          UPDATE resources
          SET content = $1
          WHERE id = $2
        `,
        values: [contentJson, resourceId]
      });
      
      // Check if there's an existing embedding for this resource
      const existingEmbeddings = await dbClient.execute({
        text: `
          SELECT id FROM embeddings WHERE resource_id = $1
        `,
        values: [resourceId]
      });
      
      if (existingEmbeddings.length > 0) {
        // Update existing embedding
        await dbClient.execute({
          text: `
            UPDATE embeddings
            SET content = $1, embedding = $2::vector
            WHERE resource_id = $3
          `,
          values: [textContent, formattedEmbedding, resourceId]
        });
      } else {
        // Create new embedding for existing resource
        const embeddingId = nanoid();
        await dbClient.execute({
          text: `
            INSERT INTO embeddings (id, resource_id, content, embedding)
            VALUES ($1, $2, $3, $4::vector)
          `,
          values: [embeddingId, resourceId, textContent, formattedEmbedding]
        });
      }
    } else {
      // Create new resource
      resourceId = nanoid();
      
      // Use raw SQL to insert because we're not sure about the schema
      await dbClient.execute({
        text: `
          INSERT INTO resources (id, content)
          VALUES ($1, $2)
        `,
        values: [resourceId, contentJson]
      });
      
      // Create embedding record for searchability
      const embeddingId = nanoid();
      await dbClient.execute({
        text: `
          INSERT INTO embeddings (id, resource_id, content, embedding)
          VALUES ($1, $2, $3, $4::vector)
        `,
        values: [embeddingId, resourceId, textContent, formattedEmbedding]
      });
    }
    
    // Process images - we'll handle these separately regardless of whether we're updating or creating
    // For simplicity, we won't try to update existing image resources
    for (const image of images) {
      if (image.alt) {
        const imageId = nanoid();
        
        await dbClient.execute({
          text: `
            INSERT INTO resources (id, content)
            VALUES ($1, $2)
          `,
          values: [imageId, JSON.stringify(image)]
        });
        
        // Create embedding for the image
        const imageEmbedding = await generateEmbedding(image.alt);
        const imageEmbeddingId = nanoid();
        const formattedImageEmbedding = `[${imageEmbedding.join(',')}]`;
        
        await dbClient.execute({
          text: `
            INSERT INTO embeddings (id, resource_id, content, embedding)
            VALUES ($1, $2, $3, $4::vector)
          `,
          values: [imageEmbeddingId, imageId, image.alt, formattedImageEmbedding]
        });
      }
    }
    
    return resourceId;
  } catch (error) {
    console.error('Error saving editor content:', error);
    throw error;
  }
};

/**
 * Retrieves editor content from the database
 */
export const getEditorContent = async (resourceId: string): Promise<{
  content: string;
  metadata: EditorMetadata | null;
}> => {
  try {
    // Wait for database initialization
    const dbClient = await waitForDbInit();
    
    // Use raw SQL to select
    const result = await dbClient.execute({
      text: `
        SELECT content, updated_at
        FROM resources
        WHERE id = $1
        LIMIT 1
      `,
      values: [resourceId]
    });
    
    if (result.length === 0) {
      console.error(`Editor content not found for resource ID: ${resourceId}`);
      throw new Error(`Editor content not found for resource ID: ${resourceId}`);
    }
    
    console.log(`Found resource with ID ${resourceId}, content type: ${typeof result[0].content}, length: ${result[0].content?.length || 0}`);
    
    // Try to parse the content as JSON
    try {
      const editorData = JSON.parse(result[0].content);
      return {
        content: extractTextFromJSON(editorData.jsonContent || {}),
        metadata: editorData,
      };
    } catch (e) {
      console.error(`Error parsing JSON content for resource ID ${resourceId}:`, e);
      console.log('Content sample:', result[0].content?.substring(0, 100));
      
      // If parsing fails, create a basic metadata structure with the raw content
      // This ensures the editor has something to display
      const fallbackMetadata: EditorMetadata = {
        title: `Note ${resourceId.substring(0, 8)}`,
        wordCount: 0,
        htmlContent: '',
        markdownContent: result[0].content || '',
        jsonContent: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: result[0].content || 'Content could not be parsed'
                }
              ]
            }
          ]
        }
      };
      
      return {
        content: result[0].content || '',
        metadata: fallbackMetadata,
      };
    }
  } catch (error) {
    console.error('Error retrieving editor content:', error);
    throw error;
  }
};

/**
 * Searches for editor content based on a query
 */
export const searchEditorContent = async (query: string): Promise<Array<{
  resourceId: string;
  content: string;
  metadata: EditorMetadata;
  similarity: number;
}>> => {
  try {
    // Wait for database initialization
    const dbClient = await waitForDbInit();
    
    const queryEmbedding = await generateEmbedding(query);
    const formattedEmbedding = `[${queryEmbedding.join(',')}]`;
    
    // For now, use raw SQL for the vector similarity search
    // since Drizzle ORM doesn't have built-in support for it
    const sqlQuery = {
      text: `
        SELECT 
          r.id as resource_id,
          r.content,
          1 - (e.embedding <=> $1::vector) as similarity
        FROM 
          embeddings e
        JOIN
          resources r ON e.resource_id = r.id
        ORDER BY 
          similarity DESC
        LIMIT 5
      `,
      values: [formattedEmbedding]
    };
    
    const results = await dbClient.execute(sqlQuery);
    
    return results.map((row: any) => {
      // Try to parse the content as JSON
      let metadata = null;
      try {
        metadata = JSON.parse(row.content);
      } catch (e) {
        // If parsing fails, create a simple metadata object
        metadata = {
          content: row.content
        };
      }
      
      return {
        resourceId: row.resource_id,
        content: row.content,
        metadata: metadata as EditorMetadata,
        similarity: row.similarity,
      };
    });
  } catch (error) {
    console.error('Error searching editor content:', error);
    throw error;
  }
};

/**
 * Retrieves all saved notes with pagination
 */
export const getAllNotes = async (page: number = 1, pageSize: number = 10): Promise<Array<{
  id: string;
  title: string;
  updatedAt: string;
  wordCount: number;
  htmlContent: string;
  markdownContent: string;
  jsonContent: JSONContent;
  images: ImageMetadata[];
}>> => {
  try {
    // Wait for database initialization
    const dbClient = await waitForDbInit();
    
    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;
    
    // Fetch notes ordered by most recently updated
    const results = await dbClient.execute({
      text: `
        SELECT id, content, updated_at
        FROM resources
        ORDER BY updated_at DESC
        LIMIT $1 OFFSET $2
      `,
      values: [pageSize, offset]
    });
    
    // Extract relevant data
    return results.map((row: any) => {
      let title = "Untitled Note";
      let wordCount = 0;
      let htmlContent = "";
      let markdownContent = "";
      let jsonContent: JSONContent = {};
      let images: ImageMetadata[] = [];
      
      try {
        const content = JSON.parse(row.content);
        title = content.title || "Untitled Note";
        wordCount = content.wordCount || 0;
        htmlContent = content.htmlContent || "";
        markdownContent = content.markdownContent || "";
        jsonContent = content.jsonContent || {};
        images = content.images || [];
      } catch (e) {
        // If parsing fails, use default values
      }
      
      return {
        id: row.id,
        title,
        updatedAt: row.updated_at,
        wordCount,
        htmlContent,
        markdownContent,
        jsonContent,
        images
      };
    });
  } catch (error) {
    console.error('Error retrieving notes:', error);
    return [];
  }
}; 