/**
 * API Logger Utility - Helps debug API responses
 */

interface LoggerOptions {
  label?: string;
  expandObjects?: boolean;
  maxDepth?: number;
}

/**
 * Logs API responses in a formatted way
 * @param data The data to log
 * @param options Logging options
 */
export function logApiResponse(data: any, options: LoggerOptions = {}) {
  const { 
    label = 'API Response', 
    expandObjects = true,
    maxDepth = 2
  } = options;

  console.group(`🔍 ${label}`);
  
  // Log the type of data
  console.log(`Type: ${Array.isArray(data) ? 'Array' : typeof data}`);
  
  // For arrays, log length and first few items
  if (Array.isArray(data)) {
    console.log(`Array Length: ${data.length}`);
    if (data.length > 0) {
      console.log('First Item Type:', typeof data[0]);
      console.log('First Few Items:', data.slice(0, 3));
    }
  }
  
  // For objects, log keys and structure
  else if (data && typeof data === 'object') {
    const keys = Object.keys(data);
    console.log(`Object Keys (${keys.length}):`, keys);
    
    // Check for common patterns in APIs
    if (data.data) console.log('Has .data property:', typeof data.data);
    if (data.products) console.log('Has .products property:', typeof data.products);
    if (data.items) console.log('Has .items property:', typeof data.items);
    if (data.results) console.log('Has .results property:', typeof data.results);
    
    // Expanded logging if requested
    if (expandObjects) {
      // Function to safely stringify objects with circular refs and max depth
      const safeStringify = (obj: any, depth = 0): string => {
        if (depth > maxDepth) return '[Object]';
        if (!obj || typeof obj !== 'object') return String(obj);
        
        try {
          if (Array.isArray(obj)) {
            return `[${obj.slice(0, 3).map(item => safeStringify(item, depth + 1)).join(', ')}${obj.length > 3 ? ', ...' : ''}]`;
          }
          
          const entries = Object.entries(obj).slice(0, 5);
          return `{${entries.map(([k, v]) => `${k}: ${safeStringify(v, depth + 1)}`).join(', ')}${Object.keys(obj).length > 5 ? ', ...' : ''}}`;
        } catch (e) {
          return '[Circular]';
        }
      };
      
      console.log('Structure:', safeStringify(data));
    }
  }
  
  console.groupEnd();
  
  return data; // Return original data for chaining
}

/**
 * Add this middleware to API request chains
 * Example: get('/api/products').then(logResponse).then(...)
 */
export function logResponse(response: any, label = 'API Response') {
  return logApiResponse(response.data, { label });
}

export default {
  logApiResponse,
  logResponse
};
