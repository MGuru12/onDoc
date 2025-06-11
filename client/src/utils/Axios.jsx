// Axios.js
import axios from 'axios';
import { useUser } from './Providers';
import db from '../db/Dexiedb';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Axios interceptor setup
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token is expired and this is the first retry
    if (error.response?.status === 498 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Refresh the token
      try {
        const response = await axios.post('/auth/Refresh',{ withCredentials: true });
        const newAccessToken = response.headers['x-access-token'];

        // Update IndexedDB
        const firstRecord = await db.tn.toCollection().first();
        if (firstRecord) {
          await db.tn.update(firstRecord.at, { at: newAccessToken });
        }

        // Use the new token in the retried request
        originalRequest.headers['x-access-token'] = newAccessToken;

        // Set in memory (needs app-level global state access)
        // If this doesn't work inside Axios.js, consider a more global store like Redux or custom context
        const { setAccessToken } = useUser(); // ⚠️ May not work here outside React
        setAccessToken(newAccessToken);

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
