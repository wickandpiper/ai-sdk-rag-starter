import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '@/lib/db';

async function main() {
  console.log('Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

main(); 