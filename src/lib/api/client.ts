// Base API Client Configuration

import { ApiError } from './types';

export interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// Get the base URL based on environment
export function getApiBaseUrl(): string {
  // In Next.js, we use relative URLs for API routes
  // This works for both client and server
  return '';
}

// Default headers for API requests
export function getDefaultHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  };
}

// Generic fetch wrapper with error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      ...getDefaultHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        data?.error || `API request failed`,
        data?.details || `Status: ${response.status}`,
        response.status
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new ApiError(
        'Network request failed',
        error.message
      );
    }
    
    throw new ApiError('Unknown error occurred');
  }
}

// POST request helper
export async function apiPost<TRequest, TResponse>(
  endpoint: string,
  data: TRequest
): Promise<TResponse> {
  return apiRequest<TResponse>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// GET request helper
export async function apiGet<TResponse>(
  endpoint: string,
  params?: Record<string, string>
): Promise<TResponse> {
  const queryString = params ? `?${new URLSearchParams(params)}` : '';
  return apiRequest<TResponse>(`${endpoint}${queryString}`, {
    method: 'GET',
  });
}