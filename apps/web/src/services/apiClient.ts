const API_URL = import.meta.env.VITE_API_URL || '';

export interface ApiError {
  status: number;
  message: string;
}

export async function apiRequest<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  
  if (!response.ok) {
    throw {
      status: response.status,
      message: `HTTP ${response.status}`,
    } as ApiError;
  }
  
  return response.json();
}
