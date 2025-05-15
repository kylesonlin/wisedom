import { useState, useEffect, useCallback, useRef } from 'react';
import { AppError, ErrorDetails, handleError } from '../utils/error-handling';
import { retry } from '../utils/common';

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cacheTime?: number;
  retries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: ErrorDetails) => void;
}

interface FetchState<T> {
  data: T | null;
  error: ErrorDetails | null;
  loading: boolean;
  status: 'idle' | 'loading' | 'success' | 'error';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function useFetch<T = any>(
  url: string,
  options: FetchOptions = {}
) {
  const {
    method = 'GET',
    headers = {},
    body,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    retries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    loading: false,
    status: 'idle',
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    try {
      setState(prev => ({ ...prev, loading: true, status: 'loading' }));

      // Check cache first
      const cachedData = cache.get(url);
      if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
        setState({
          data: cachedData.data,
          error: null,
          loading: false,
          status: 'success',
        });
        onSuccess?.(cachedData.data);
        return;
      }

      const response = await retry(
        async () => {
          const res = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal,
          });

          if (!res.ok) {
            throw new AppError(`HTTP error! status: ${res.status}`, {
              message: `HTTP error! status: ${res.status}`,
              code: `HTTP_${res.status}`,
              severity: res.status >= 500 ? 'high' : 'medium',
            });
          }

          return res;
        },
        retries,
        retryDelay
      );

      const data = await response.json();

      // Update cache
      cache.set(url, {
        data,
        timestamp: Date.now(),
      });

      setState({
        data,
        error: null,
        loading: false,
        status: 'success',
      });

      onSuccess?.(data);
    } catch (error) {
      const errorDetails = handleError(error);
      setState({
        data: null,
        error: errorDetails,
        loading: false,
        status: 'error',
      });
      onError?.(errorDetails);
    }
  }, [url, method, headers, body, cacheTime, retries, retryDelay, onSuccess, onError]);

  const refetch = useCallback(() => {
    // Clear cache for this URL
    cache.delete(url);
    
    // Create new AbortController
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    return fetchData(abortControllerRef.current.signal);
  }, [url, fetchData]);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cache.clear();
  }, []);

  return {
    ...state,
    refetch,
    clearCache,
  };
} 