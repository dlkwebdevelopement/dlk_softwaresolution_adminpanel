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
export const getImgUrl = (pathData) => {
  if (!pathData) return "";
  let path = typeof pathData === 'string' ? pathData : pathData.url;
  if (!path) return "";

  // If the path is an absolute URL pointing to localhost or the production domain,
  // we strip the domain part to ensure we use the current BASE_URL.
  if (path.startsWith("http")) {
    const localPrefix = "http://localhost:5000";
    const prodPrefix = "https://backend.dlksoftwaresolutions.co.in";
    
    if (path.startsWith(localPrefix)) {
      path = path.replace(localPrefix, "");
    } else if (path.startsWith(prodPrefix)) {
      path = path.replace(prodPrefix, "");
    } else {
      // It's an external URL (like an S3 bucket or placeholder), return as is
      return path;
    }
  }

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
