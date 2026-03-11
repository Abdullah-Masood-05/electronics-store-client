import api from "../lib/axios";

/**
 * Fetch the current authenticated user's profile from the backend.
 */
export const fetchCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

/**
 * Create or update user in the backend after Firebase registration.
 */
export const createOrUpdateUser = async (data) => {
  const response = await api.post("/auth/create-or-update", data);
  return response.data;
};
