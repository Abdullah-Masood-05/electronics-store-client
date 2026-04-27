import api from "../lib/axios";

export const saveCart = async (cart) => {
  const res = await api.post("/cart", { cart });
  return res.data;
};

export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

export const emptyCart = async () => {
  const res = await api.delete("/cart");
  return res.data;
};
