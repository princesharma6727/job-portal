import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://job-portal10.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.message);
    
    // Handle rate limiting errors
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded. Please wait before making more requests.');
      // You could show a user-friendly toast message here
    }
    
    return Promise.reject(error);
  }
);

export default api; 