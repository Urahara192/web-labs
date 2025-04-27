import { axiosInstance } from "./axiosInstance";

export const fetchEvents = async (showDeleted = false, token?: string) => {
  const response = await axiosInstance.get("/events", {
    params: { showDeleted },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return response.data;
};
