import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:5100/api`;

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return config;
});

export function readHeaderToken(response) {
  const authHeader = response.headers?.authorization || response.headers?.Authorization;
  const expiry = response.headers?.['x-token-expires-at'] || response.headers?.['X-Token-Expires-At'];
  return { authHeader, expiry };
}

export function getApiError(error) {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (data?.title) return data.title;
  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ');
  }
  return error?.message || 'Unexpected error happened.';
}

export default http;
