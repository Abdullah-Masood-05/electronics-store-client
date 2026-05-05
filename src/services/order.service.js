import api from "../lib/axios";

export const createCodOrder = async (data) => {
  const res = await api.post("/orders/cod", data);
  return res.data;
};

export const createStripeIntent = async (data) => {
  const res = await api.post("/orders/stripe/intent", data);
  return res.data;
};

export const confirmStripeOrder = async (data) => {
  const res = await api.post("/orders/stripe/confirm", data);
  return res.data;
};

export const getUserOrders = async () => {
  const res = await api.get("/orders/mine");
  return res.data;
};

export const getAllOrders = async () => {
  const res = await api.get("/orders/all");
  return res.data;
};

export const updateOrderStatus = async (id, status) => {
  const res = await api.put(`/orders/${id}/status`, { status });
  return res.data;
};

export const getOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

