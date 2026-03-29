import api from "../lib/axios";

export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

export const getCategory = async (slug) => {
  const res = await api.get(`/categories/${slug}`);
  return res.data;
};

export const createCategory = async (data) => {
  const res = await api.post("/categories", data);
  return res.data;
};

export const updateCategory = async (slug, data) => {
  const res = await api.put(`/categories/${slug}`, data);
  return res.data;
};

export const removeCategory = async (slug) => {
  const res = await api.delete(`/categories/${slug}`);
  return res.data;
};
