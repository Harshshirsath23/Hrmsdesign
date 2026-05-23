import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;

export function unwrap<T>(response: { data: { data: T } | T }): T {
  if (typeof response.data === 'object' && response.data !== null && 'data' in response.data) {
    return response.data.data as T;
  }
  return response.data as T;
}
