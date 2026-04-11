// Axios.js
import axios from 'axios';
import { useUser } from './Providers';
import db from '../db/Dexiedb';
import { authStore } from './AuthStore';

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001');

const api = axios.create({
  baseURL,
});

// Axios interceptor setup
api.interceptors.response.use(
  res => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 498 && !originalRequest._retry) {
      originalRequest._retry = true;

      const response = await axios.post(
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
    }

    return Promise.reject(error);
  }
);


api.interceptors.request.use((config) => {
  const token = authStore.getAccessToken();
  if (token) {
    config.headers['x-access-token'] = token;
  }
  return config;
});


export default api;
