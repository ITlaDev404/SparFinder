const API_BASE = '/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
}

export async function apiCall(endpoint: string, options: RequestOptions = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return res.json();
}