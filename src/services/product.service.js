import api from "../lib/axios";

export const getProducts = async (page = 1, limit = 10) => {
  const res = await api.get(`/products?page=${page}&limit=${limit}`);
  return res.data;
};

export const getProduct = async (slug) => {
  const res = await api.get(`/products/${slug}`);
  return res.data;
};

export const createProduct = async (data) => {
  const res = await api.post("/products", data);
  return res.data;
};

export const updateProduct = async (slug, data) => {
  const res = await api.put(`/products/${slug}`, data);
  return res.data;
};

export const removeProduct = async (slug) => {
  const res = await api.delete(`/products/${slug}`);
  return res.data;
};

export const getProductCount = async () => {
  const res = await api.get("/products/count");
  return res.data;
};
