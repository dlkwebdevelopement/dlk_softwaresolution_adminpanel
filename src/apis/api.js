import axios from "axios";

export const BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://backend.dlksoftwaresolutions.co.in";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// ✅ Helper to get full image URL
export const getImgUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // Handle double slashes if any
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};

// ✅ GET request
export const GetRequest = async (url) => {
  const res = await api.get(url);
  return res.data;
};

// ✅ POST request
export const PostRequest = async (url, data) => {
  const res = await api.post(url, data);
  return res.data;
};

// ✅ PATCH request 
export const PatchRequest = async (url, data) => {
  const res = await api.patch(url, data);
  return res.data;
};

// ✅ PUT request 
export const PutRequest = async (url, data) => {
  const res = await api.put(url, data);
  return res.data;
};

// ✅ DELETE request
export const DeleteRequest = async (url, config = {}) => {
  const res = await api.delete(url, config);
  return res.data;
};
