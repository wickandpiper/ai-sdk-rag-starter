// This file should only be imported from server-side code
// For Next.js pages directory, we'll handle this in the index.ts file

// Import postgres correctly (CommonJS-style with destructuring)
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { env } from '@/lib/env.mjs';

// Import schema files directly
import { resources } from './schema/resources';
import { embeddings } from './schema/embeddings';

// Create a schema object
const schema = { resources, embeddings };

// Create a generic db interface that both implementations can satisfy
export interface DbInterface {
  query: (...args: any[]) => any;
  execute: (query: any) => Promise<any>;
  [key: string]: any;
}

// Get the database URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL;

// Create a simplified implementation for server-side
let dbInstance: DbInterface | null = null;
let pgPool: Pool | null = null;

// Simple function to get or create the database instance
function getDbInstance(): DbInterface {
  if (!dbInstance) {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    try {
      console.log('Initializing database connection with URL:', DATABASE_URL.substring(0, 20) + '...');
      
      // Create a postgres connection using pg
      pgPool = new Pool({
        connectionString: DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });
      
      // Create a wrapper that implements our interface
      dbInstance = {
        query: async (query: string, ...params: any[]) => {
          if (!pgPool) throw new Error('Database not initialized');
          try {
            console.log('Executing query:', query.substring(0, 50) + (query.length > 50 ? '...' : ''));
            const result = await pgPool.query(query, params.length ? params[0] : undefined);
            // Return the rows array directly to match the expected format
            return result.rows;
          } catch (error) {
            console.error('Error executing query:', error);
            throw error;
          }
        },
        execute: async (query: any) => {
          if (!pgPool) throw new Error('Database not initialized');
          
          try {
            let result;
            if (typeof query === 'string') {
              console.log('Executing string query:', query.substring(0, 50) + (query.length > 50 ? '...' : ''));
              result = await pgPool.query(query);
            } else if (query.text && query.values) {
              console.log('Executing parameterized query:', query.text.substring(0, 50) + (query.text.length > 50 ? '...' : ''));
              result = await pgPool.query(query.text, query.values);
            } else if (query.sql) {
              // Handle drizzle sql template literals
              try {
                console.log('Executing drizzle SQL query');
                // Try to extract text and values from the SQL template literal
                let sqlQuery;
                if (typeof query.sql === 'string') {
                  sqlQuery = { text: query.sql, values: [] };
                } else if (query.sql.strings && Array.isArray(query.sql.strings)) {
                  // Handle tagged template literals
                  const strings = query.sql.strings;
                  const values = query.sql.values || [];
                  let text = strings[0];
                  for (let i = 0; i < values.length; i++) {
                    text += `$${i+1}` + strings[i+1];
                  }
                  sqlQuery = { text, values };
                } else if (query.sql.text && query.sql.values) {
                  sqlQuery = { text: query.sql.text, values: query.sql.values };
                } else {
                  console.error('Unrecognized SQL query format:', query.sql);
                  throw new Error('Invalid SQL query format');
                }
                
                result = await pgPool.query(sqlQuery.text, sqlQuery.values);
              } catch (sqlError) {
                console.error('Error processing SQL query:', sqlError, query.sql);
                throw sqlError;
              }
            } else {
              console.error('Invalid query format:', query);
              throw new Error('Invalid query format');
            }
            
            // Return the rows array directly to match the expected format
            return result.rows;
          } catch (error) {
            console.error('Error executing query:', error);
            throw error;
          }
        }
      };
      
      console.log('Database connection initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
  
  return dbInstance;
}

// Export a lazy-loaded database instance
export const db: DbInterface = typeof window === 'undefined' 
  ? new Proxy({} as DbInterface, {
      get: (_target, prop: string | symbol) => {
        const instance = getDbInstance();
        return instance[prop as keyof DbInterface];
      }
    })
  : {} as DbInterface;

// Function to wait for database initialization
export const waitForDbInit = async (): Promise<DbInterface> => {
  if (typeof window !== 'undefined') {
    throw new Error('Cannot initialize database on the client side');
  }
  
  try {
    console.log('Waiting for database initialization...');
    const instance = getDbInstance();
    // Test the connection with a simple query
    console.log('Testing database connection...');
    await instance.query('SELECT 1 as test');
    console.log('Database connection test successful');
    return instance;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// Export sql for use in queries
export { sql }; 