import { createResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';
import { searchEditorContent } from '@/lib/services/editor-service';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Change from Edge runtime to Node.js runtime
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // check if user has sent a PDF
  const messagesHavePDF = messages.some((message: { experimental_attachments: any[]; }) =>
    message.experimental_attachments?.some(
      (a: { contentType: string; }) => a.contentType === 'application/pdf',
    ),
  );

  // Extract the latest user message
  const latestMessage = messages[messages.length - 1];
  const userQuestion = latestMessage?.role === 'user' ? latestMessage.content : null;

  const result = await streamText({
    model: messagesHavePDF
      ? anthropic('claude-3-5-sonnet-latest')
      : openai('gpt-4o'),
    messages,
    system: `You are a helpful assistant. Use the 'getInformation' tool to fetch relevant information from the knowledge base for every user question. If no relevant information is found, the tool will handle the response.`,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base. If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z.string().describe('the content or resource to add to the knowledge base'),
        }),
        execute: async ({ content }) => createResource({ 
          content, 
          type: 'text', 
          metadata: {} 
        }),
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => {
          console.log('Fetching info for:', question);
          
          // Search for relevant content from both embeddings and editor content
          const [embeddingResults, editorResults] = await Promise.all([
            findRelevantContent(question),
            searchEditorContent(question)
          ]);
          
          // Combine results
          let context = '';
          
          // Add embedding results
          if (embeddingResults.length > 0) {
            context += 'Relevant content from knowledge base:\n';
            embeddingResults.forEach((result: { name: string; similarity: number }, i: number) => {
              context += `${i + 1}. ${result.name}\n`;
            });
            context += '\n';
          }
          
          // Add editor content results
          if (editorResults.length > 0) {
            context += 'Relevant content from editor documents:\n';
            editorResults.forEach((result, i) => {
              context += `${i + 1}. ${result.content}\n`;
              
              // If there are images in the metadata, include their alt text
              if (result.metadata?.images && result.metadata.images.length > 0) {
                context += 'Related images:\n';
                result.metadata.images.forEach((image, j) => {
                  if (image.alt) {
                    context += `  - Image ${j + 1}: ${image.alt}\n`;
                  }
                });
              }
            });
            context += '\n';
          }
          
          return context || "Sorry, I don't know.";
        }
      }),
    },
    toolChoice: userQuestion
      ? { type: 'tool', toolName: 'getInformation' } // Force getInformation for user questions
      : 'auto', // Let model decide for other cases
  });

  return result.toDataStreamResponse();
}