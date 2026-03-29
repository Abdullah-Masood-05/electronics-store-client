import api from "../lib/axios";

export const getSubCategories = async (parentId) => {
  const params = parentId ? `?parent=${parentId}` : "";
  const res = await api.get(`/subcategories${params}`);
  return res.data;
};

export const getSubCategory = async (slug) => {
  const res = await api.get(`/subcategories/${slug}`);
  return res.data;
};

export const createSubCategory = async (data) => {
  const res = await api.post("/subcategories", data);
  return res.data;
};

export const updateSubCategory = async (slug, data) => {
  const res = await api.put(`/subcategories/${slug}`, data);
  return res.data;
};

export const removeSubCategory = async (slug) => {
  const res = await api.delete(`/subcategories/${slug}`);
  return res.data;
};
