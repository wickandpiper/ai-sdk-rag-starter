// This file provides a safe way to access the database from anywhere in the application
// It handles the client vs server environment differences

// Simple database interface
export interface DbInterface {
  query: (...args: any[]) => Promise<any>;
  execute: (query: any) => Promise<any>;
}

// Simple dummy implementation for client-side
const dummyDb: DbInterface = {
  query: async () => {
    throw new Error('Database operations can only be performed on the server');
  },
  execute: async () => {
    throw new Error('Database operations can only be performed on the server');
  }
};

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Initialize the database - this should only be called on the server
 * @returns A promise that resolves to the database connection
 */
export async function waitForDbInit(): Promise<DbInterface> {
  if (isBrowser) {
    console.error('waitForDbInit was called in the browser');
    throw new Error('Database operations can only be performed on the server');
  }
  
  // For server-side only, we can use require
  const serverDb = require('./server-db').getServerDb();
  return serverDb;
}

/**
 * The database client - only usable on the server
 */
export const db = isBrowser ? dummyDb : require('./server-db').getServerDb();

// Export SQL for server-side queries
export const sql = isBrowser ? {} : require('./server-db').sql;

