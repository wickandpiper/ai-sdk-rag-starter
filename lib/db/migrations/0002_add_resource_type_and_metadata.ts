import { sql } from 'drizzle-orm';

export async function up(db: any) {
  await db.execute(sql`
    ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS type varchar(50) DEFAULT 'text',
    ADD COLUMN IF NOT EXISTS metadata jsonb
  `);
}

export async function down(db: any) {
  await db.execute(sql`
    ALTER TABLE resources
    DROP COLUMN IF EXISTS type,
    DROP COLUMN IF EXISTS metadata
  `);
} 