// Test file to check if postgres can be imported correctly
import postgres from 'postgres';
import { waitForDbInit } from './server';

// Check that postgres is imported correctly
console.log('Postgres imported:', typeof postgres === 'function' ? 'Success' : 'Failed');

// Test database connection
async function testConnection() {
  try {
    console.log('Testing database connection...');
    const db = await waitForDbInit();
    console.log('Database connection successful!');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Export the test function
export { testConnection }; 