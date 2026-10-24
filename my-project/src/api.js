import axios from 'axios';

export const TOKEN_KEY = 'accessToken';
const baseURL = 'http://localhost:3001';

export const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = null;

function refreshAccessToken() {
  if (!refreshing) {
    refreshing = axios
      .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        localStorage.setItem(TOKEN_KEY, res.data.accessToken);
        return res.data.accessToken;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        window.location.reload();
      }
    }
    return Promise.reject(error);
  },
);

export default api;