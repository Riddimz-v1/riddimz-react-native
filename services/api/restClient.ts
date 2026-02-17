import { storage } from '@/utils/storage';
import { REST_API_URL } from '@/utils/constants';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = options;

  const url = `${REST_API_URL}${endpoint}`;
  console.log(`[RestClient] Fetching: ${url}`);
  
  const requestHeaders: Record<string, string> = {
    ...headers,
    'ngrok-skip-browser-warning': 'true',
  };

  if (!(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await storage.getItem('auth_token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const isForm = requestHeaders['Content-Type'] === 'application/x-www-form-urlencoded';

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body instanceof FormData ? body : (body ? (isForm ? body : JSON.stringify(body)) : undefined),
    });
  } catch (error) {
    console.error(`[RestClient] Network error fetching ${url}:`, error);
    throw error;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = typeof data?.detail === 'object' 
        ? JSON.stringify(data.detail) 
        : data?.detail || data?.message || 'An error occurred';
        
    throw new ApiError(
      errorMessage,
      response.status,
      data
    );
  }

  return data as T;
}

export const restClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'POST', body }),
  
  patch: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'PATCH', body }),
  
  put: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'PUT', body }),
  
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
