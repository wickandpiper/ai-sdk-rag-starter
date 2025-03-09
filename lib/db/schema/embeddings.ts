import { nanoid } from '@/lib/utils';
import { index, pgTable, text, varchar, vector, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { resources } from './resources';

export const embeddings = pgTable(
  'embeddings',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resourceId: varchar('resource_id', { length: 191 }).references(
      () => resources.id,
      { onDelete: 'cascade' },
    ),
    content: text('content').notNull(),
    contentType: varchar('content_type', { length: 50 }).default('text'),
    metadata: jsonb('metadata'),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`now()`),
  },
  table => ({
    embeddingIndex: index('embeddingIndex').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ),
  }),
);

// Define types for the metadata field
export type ImageMetadata = {
  alt?: string;
  width?: number;
  height?: number;
  src: string;
  mimeType?: string;
};

export type EditorMetadata = {
  title?: string;
  wordCount?: number;
  htmlContent?: string;
  markdownContent?: string;
  images?: ImageMetadata[];
}; 