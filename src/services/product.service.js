import api from "../lib/axios";

export const getProducts = async (page = 1, limit = 10, sort = "newest") => {
  const res = await api.get(`/products?page=${page}&limit=${limit}&sort=${sort}`);
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

export const getProductsByCategory = async (slug, page = 1, limit = 12) => {
  const res = await api.get(`/products/category/${slug}?page=${page}&limit=${limit}`);
  return res.data;
};

export const getProductsBySubCategory = async (slug, page = 1, limit = 12) => {
  const res = await api.get(`/products/subcategory/${slug}?page=${page}&limit=${limit}`);
  return res.data;
};

export const submitRating = async (productId, star) => {
  const res = await api.put("/products/rating", { productId, star });
  return res.data;
};

export const getTrendingProducts = async (limit = 6) => {
  const res = await api.get(`/products/trending?limit=${limit}`);
  return res.data;
};

export const trackProductClick = async (slug) => {
  try {
    await api.post(`/products/${slug}/click`);
  } catch {
    // Fire-and-forget — don't block user navigation
  }
};
