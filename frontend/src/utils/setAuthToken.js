import axios from 'axios';

/**
 * Set or remove the auth token in axios headers
 * @param {string|null} token - The JWT token or null to remove the token
 */
const setAuthToken = (token) => {
  if (token) {
    // Set the auth token in axios headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Store the token in the axios instance for reference
    axios.defaults.headers.common['X-Has-Token'] = 'true';
    
    console.log('Auth token set in axios headers');
  } else {
    // Remove the auth token from axios headers
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['X-Has-Token'];
    
    console.log('Auth token removed from axios headers');
  }
};

export default setAuthToken;
