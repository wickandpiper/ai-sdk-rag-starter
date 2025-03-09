// Script to test database connection
import { testConnection } from '../lib/db/test-connection';

// Run the test
async function run() {
  try {
    const result = await testConnection();
    if (result) {
      console.log('✅ Database connection test succeeded');
      process.exit(0);
    } else {
      console.log('❌ Database connection test failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running test:', error);
    process.exit(1);
  }
}

run(); 