import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Base API URL; in development proxied by vite
export const API_BASE_URL = (() => {
  if (import.meta.env.DEV) return '';
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const origin = window.location.origin;
  if (origin.includes('-admin')) return origin.replace('-admin', '');
  return origin;
})();

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}  

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // In development, use the URL as-is since vite handles proxying
  // In production, prepend API_BASE_URL if the URL starts with "/"
  const fullUrl = import.meta.env.DEV ? url : (url.startsWith('/') ? `${API_BASE_URL}${url}` : url);

  let headers: Record<string, string> = {};
  let body: any = undefined;

  if (data instanceof FormData) {
    // For FormData (file upload), do NOT set Content-Type (browser will set it)
    body = data;
  } else if (data) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(data);
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Prepend API_BASE_URL if the queryKey URL starts with "/"
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : url;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
}); 