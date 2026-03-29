import api from "../lib/axios";

export const getActiveDeals = async () => {
  const res = await api.get("/deals");
  return res.data;
};

export const getAllDeals = async () => {
  const res = await api.get("/deals/all");
  return res.data;
};

export const createDeal = async (data) => {
  const res = await api.post("/deals", data);
  return res.data;
};

export const updateDeal = async (id, data) => {
  const res = await api.put(`/deals/${id}`, data);
  return res.data;
};

export const removeDeal = async (id) => {
  const res = await api.delete(`/deals/${id}`);
  return res.data;
};
