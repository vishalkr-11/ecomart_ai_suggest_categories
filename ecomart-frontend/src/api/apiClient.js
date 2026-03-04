import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 60000, // 60s — AI calls can be slow
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach correlation ID ───────────────────────────
apiClient.interceptors.request.use((config) => {
  config.headers['X-Client-ID'] = 'ecomart-frontend-v1';
  return config;
});

// ── Response interceptor — unwrap data, handle errors ─────────────────────
apiClient.interceptors.response.use(
  (res) => res.data, // Return the full response body
  (err) => {
    const status  = err.response?.status;
    const message = err.response?.data?.error?.message || err.message;

    if (status === 429) {
      toast.error('Rate limit reached. Please wait a moment.');
    } else if (status === 502) {
      toast.error('AI service error. Retrying may help.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again.');
    }

    return Promise.reject({ status, message, raw: err.response?.data });
  }
);

export default apiClient;
