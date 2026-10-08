import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a human-readable message from an axios error.
 * Backend error shapes handled: { error }, { message }, and field maps
 * like { password: "Password must be at least 8 characters" }.
 */
export function errorMessage(err, fallback = 'Something went wrong') {
  if (!err.response) {
    return 'Cannot reach the server — is the backend running on port 8080?';
  }
  const data = err.response.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    if (typeof data.error === 'string') return data.error;
    if (typeof data.message === 'string') return data.message;
    const first = Object.values(data).find((v) => typeof v === 'string');
    if (first) return first;
  }
  return fallback;
}

export default client;