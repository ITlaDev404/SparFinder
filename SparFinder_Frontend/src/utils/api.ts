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

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, fetchOptions);
  return res.json();
}