import Constants from 'expo-constants';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  Constants.expoConfig?.extra?.apiUrl || 
  '';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

interface RequestConfig {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

interface ApiError {
  status: number;
  message: string;
  data?: any;
}

// In-flight request deduplication
const inflightRequests = new Map<string, Promise<any>>();

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createRequestKey(url: string, config?: RequestConfig): string {
  return `${config?.method || 'GET'}:${url}:${JSON.stringify(config?.body || '')}`;
}

async function fetchWithRetry(
  url: string,
  config: RequestConfig = {},
  retryCount = 0
): Promise<Response> {
  const controller = new AbortController();
  const timeout = config.timeout || 30000;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      method: config.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Retry on specific status codes
    if (RETRYABLE_STATUS_CODES.includes(response.status) && retryCount < MAX_RETRIES) {
      const delayMs = RETRY_DELAY_BASE * Math.pow(2, retryCount);
      await delay(delayMs);
      return fetchWithRetry(url, config, retryCount + 1);
    }
    
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw { status: 408, message: 'Request timeout' } as ApiError;
    }
    
    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
      const delayMs = RETRY_DELAY_BASE * Math.pow(2, retryCount);
      await delay(delayMs);
      return fetchWithRetry(url, config, retryCount + 1);
    }
    
    throw { status: 0, message: 'Network error' } as ApiError;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const requestKey = createRequestKey(url, config);
  
  // Deduplicate in-flight requests for GET
  if ((config.method || 'GET') === 'GET') {
    const existing = inflightRequests.get(requestKey);
    if (existing) {
      return existing as Promise<T>;
    }
  }
  
  const requestPromise = (async () => {
    try {
      const response = await fetchWithRetry(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.detail || `HTTP ${response.status}`,
          data: errorData,
        } as ApiError;
      }
      
      return await response.json();
    } finally {
      inflightRequests.delete(requestKey);
    }
  })();
  
  if ((config.method || 'GET') === 'GET') {
    inflightRequests.set(requestKey, requestPromise);
  }
  
  return requestPromise;
}

export function isUseMock(): boolean {
  return USE_MOCK;
}

export { ApiError };
