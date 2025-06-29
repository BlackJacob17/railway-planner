// This file helps debug environment variables in production
// It will log all environment variables that start with REACT_APP_

const envVars = {};

// Get all environment variables that start with REACT_APP_
Object.keys(process.env).forEach(key => {
  if (key.startsWith('REACT_APP_')) {
    envVars[key] = process.env[key];
  }
});

console.log('Environment Variables in use:', envVars);
console.log('API Base URL:', process.env.REACT_APP_API_URL || 'Using fallback URL');

export default envVars;
