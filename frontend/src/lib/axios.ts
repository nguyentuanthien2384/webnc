// src/lib/axios.ts
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

// Tạo một instance axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const store = useAuthStore.getState();
      if (store.isAuthenticated) {
        store.logout();
      }
    }
    return Promise.reject(error);
  },
);

export default api;
