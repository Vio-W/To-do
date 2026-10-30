import axios from 'axios';

export const TOKEN_KEY = 'accessToken';
const baseURL = 'http://localhost:3001';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
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
        const token = res.data.accessToken;
        localStorage.setItem(TOKEN_KEY, token);
        return token;
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
        original.headers = original.headers ?? {};
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

export const getProfile = () => api.get('/profile');
export const updateProfile = (payload) => api.patch('/profile', payload);

export const getTasks = () => api.get('/todos');
export const createTask = (title, extras = {}) =>
  api.post('/todos', { title, status: 'To Do', ...extras });
export const updateTask = (id, changes) => api.patch(`/todos/${id}`, changes);
export const deleteTask = (id) => api.delete(`/todos/${id}`);

export default api;
