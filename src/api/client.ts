import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms_access_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;

export function unwrap<T>(response: { data: { data: T } | T }): T {
  if (typeof response.data === 'object' && response.data !== null && 'data' in response.data) {
    return response.data.data as T;
  }
  return response.data as T;
}
