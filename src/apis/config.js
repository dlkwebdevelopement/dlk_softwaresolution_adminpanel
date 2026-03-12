import api from './api';

// GET request
export const GetRequest = async (url) => {
  const res = await api.get(url);
  return res.data;
};

// POST request
export const PostRequest = async (url, data) => {
  const res = await api.post(url, data);
  return res.data;
};

// PATCH request 
export const PatchRequest = async (url, data) => {
  const res = await api.patch(url, data);
  return res.data;
};

// PUT request 
export const PutRequest = async (url, data) => {
  const res = await api.put(url, data);
  return res.data;
};

// DELETE request
export const DeleteRequest = async (url, config = {}) => {
  const res = await api.delete(url, config);
  return res.data;
};