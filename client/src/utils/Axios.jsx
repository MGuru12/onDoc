// Axios.js
import axios from 'axios';
import { useUser } from './Providers';
import db from '../db/Dexiedb';
import { authStore } from './AuthStore';
import { showLoader, hideLoader } from './LoadingService';

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001');

const api = axios.create({
  baseURL,
});

// Axios interceptor setup
api.interceptors.response.use(
  res => {
    hideLoader();
    return res;
  },
  async (error) => {
    hideLoader();
    const originalRequest = error.config;

    if (error.response?.status === 498 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await api.post(
          '/auth/Refresh',
          null,
          { withCredentials: true }
        );

        const newAccessToken = response.headers['x-access-token'];

        // Update store
        authStore.setAccessToken(newAccessToken);

        // Update IndexedDB
        const firstRecord = await db.tn.toCollection().first();
        if (firstRecord) {
          await db.tn.update(firstRecord.at, { at: newAccessToken });
        }

        originalRequest.headers['x-access-token'] = newAccessToken;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails (logout user immediately)
        authStore.clear();
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshError);
      }
    }


    return Promise.reject(error);
  }
);


api.interceptors.request.use((config) => {
  showLoader();
  const token = authStore.getAccessToken();
  if (token) {
    config.headers['x-access-token'] = token;
  }
  return config;
}, (error) => {
  hideLoader();
  return Promise.reject(error);
});


export default api;
