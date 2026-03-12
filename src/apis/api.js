import axios from "axios";

export const BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://backend.dlksoftwaresolutions.co.in";

const api = axios.create({
  baseURL: BASE_URL,
  // headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
