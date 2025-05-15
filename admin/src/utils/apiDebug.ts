// API Debugging utility
import axios from 'axios';

// Create an axios instance with debug logging
const debugApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Always send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
debugApi.interceptors.request.use(
  config => {
    console.log(`🔍 Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('🔍 Request headers:', config.headers);
    if (config.data) console.log('🔍 Request data:', config.data);
    return config;
  },
  error => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
debugApi.interceptors.response.use(
  response => {
    console.log(`✅ Response (${response.status}): ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('📄 Response data:', response.data);
    return response;
  },
  error => {
    if (error.response) {
      console.error(`❌ Response error (${error.response.status}): ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error('📄 Error response:', error.response.data);
    } else {
      console.error('❌ Request failed:', error.message);
    }
    return Promise.reject(error);
  }
);

export const checkApiConnection = async () => {
  try {
    // Test basic connectivity
    console.log('🔄 Testing API connection...');
    const response = await debugApi.get('/api/health');
    console.log('✅ API connection successful:', response.data);
    
    // Test admin auth status
    console.log('🔄 Checking admin authentication status...');
    try {
      const authResponse = await debugApi.get('/api/admin/auth/verify');
      console.log('✅ Auth check successful:', authResponse.data);
      return true;
    } catch (authError) {
      console.log('❌ Authentication check failed - you need to log in.');
      return false;
    }
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};

export default debugApi;
