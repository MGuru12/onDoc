const path = require('path');
const dotenv = require('dotenv');

// Determine the environment (default to 'development' if not set)
const env = process.env.NODE_ENV.trim() || '';

let envPath;

switch (env) {
  case 'dev':
    envPath = path.resolve(__dirname, '.env.dev');
    break;
  case 'prod':
    envPath = path.resolve(__dirname, '.env.prod');
    break;
  default:
    envPath = path.resolve(__dirname, '.env');
}

// Load environment variables
dotenv.config({ path: envPath });

console.log(`Running in ${env} mode`);
