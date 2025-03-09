// SERVER SIDE ONLY - This file should never be imported on the client
// It uses Node.js modules that are not available in the browser

import { Pool } from 'pg';
import { sql } from 'drizzle-orm';

// Import schema files
import { resources } from './schema/resources';
import { embeddings } from './schema/embeddings';

// Database interface
interface DbInterface {
  query: (...args: any[]) => Promise<any>;
  execute: (query: any) => Promise<any>;
}

// Singleton pool instance
let pool: Pool | null = null;

// Singleton database client instance
let dbInstance: DbInterface | null = null;

/**
 * Get the PostgreSQL connection pool
 */
function getPool(): Pool {
  if (!pool) {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Creating PostgreSQL connection pool');
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

/**
 * Get the database client instance
 */
function getServerDb(): DbInterface {
  if (!dbInstance) {
    const pgPool = getPool();
    
    console.log('Creating database client instance');
    dbInstance = {
      query: async (query: string, ...params: any[]) => {
        try {
          console.log(`Executing query: ${query.substring(0, 50)}${query.length > 50 ? '...' : ''}`);
          const result = await pgPool.query(query, params.length ? params[0] : undefined);
          return result.rows;
        } catch (error) {
          console.error('Query error:', error);
          throw error;
        }
      },
      
      execute: async (query: any) => {
        try {
          if (typeof query === 'string') {
            console.log(`Executing string query: ${query.substring(0, 50)}${query.length > 50 ? '...' : ''}`);
            const result = await pgPool.query(query);
            return result.rows;
          } 
          else if (query.text && query.values) {
            console.log(`Executing parameterized query: ${query.text.substring(0, 50)}${query.text.length > 50 ? '...' : ''}`);
            const result = await pgPool.query(query.text, query.values);
            return result.rows;
          } 
          else if (query.sql) {
            console.log('Executing SQL template query');
            // Try to handle drizzle's SQL template literals
            let sqlQuery;
            
            if (typeof query.sql === 'string') {
              sqlQuery = { text: query.sql, values: [] };
            } 
            else if (query.sql.text && Array.isArray(query.sql.values)) {
              sqlQuery = { text: query.sql.text, values: query.sql.values };
            }
            else {
              console.error('Unrecognized SQL query format:', query.sql);
              throw new Error('Invalid SQL query format');
            }
            
            const result = await pgPool.query(sqlQuery.text, sqlQuery.values);
            return result.rows;
          }
          
          throw new Error('Invalid query format');
        } catch (error) {
          console.error('Execute error:', error);
          throw error;
        }
      }
    };
  }
  
  return dbInstance;
}

export { getServerDb, sql }; 