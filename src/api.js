import axios from "axios";

export const api = axios.create({
baseURL: "https://ecomerce2-backend-1.onrender.com/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


