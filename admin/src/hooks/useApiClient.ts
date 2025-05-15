import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useState } from 'react';
import { useAdminAuth } from './useAdminAuth';

interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export function useApiClient() {
  const { logout } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable sending cookies in cross-domain requests
  });

  // Authentication is handled via cookies, so no need to add Authorization header
  apiClient.interceptors.request.use((config) => {
    return config;
  });

  // Handle unauthorized responses
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Unauthorized, log out user
        logout();
      }
      return Promise.reject(error);
    }
  );

  async function handleRequest<T>(
    requestFunc: () => Promise<AxiosResponse>,
  ): Promise<ApiResponse<T>> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await requestFunc();
      return {
        data: response.data,
        status: response.status,
        message: response.data.message,
      };
    } catch (err: any) {
      setError(err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      return {
        data: {} as T,
        status: err.response?.status || 500,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }

  const get = <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return handleRequest<T>(() => apiClient.get(url, config));
  };

  const post = <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return handleRequest<T>(() => apiClient.post(url, data, config));
  };

  const put = <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return handleRequest<T>(() => apiClient.put(url, data, config));
  };

  const del = <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return handleRequest<T>(() => apiClient.delete(url, config));
  };

  return {
    get,
    post,
    put,
    del,
    isLoading,
    error,
  };
}
