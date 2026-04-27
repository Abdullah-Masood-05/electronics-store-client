import api from "../lib/axios";

export const getCoupons = async () => {
  const res = await api.get("/coupons");
  return res.data;
};

export const createCoupon = async (data) => {
  const res = await api.post("/coupons", data);
  return res.data;
};

export const removeCoupon = async (id) => {
  const res = await api.delete(`/coupons/${id}`);
  return res.data;
};

export const applyCoupon = async (code) => {
  const res = await api.post("/coupons/apply", { code });
  return res.data;
};
