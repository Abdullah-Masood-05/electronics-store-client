import api from "../lib/axios";

export const getAdminStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};
